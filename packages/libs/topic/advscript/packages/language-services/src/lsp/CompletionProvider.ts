import * as langium from "langium";
import {
  Assignment,
  AstNode,
  CstNode,
  isAssignment,
  isCrossReference,
  isKeyword,
  isLinkingError,
  isParserRule,
  isReference,
  Reference,
} from "langium";
import { AdvScriptServices, getContainerOfTypeUntil } from "..";
import * as ast from "../ast-utils";
import type * as References from "../references";
import type { LspTypes } from "../_lsp";
import * as _lsp from "../_lsp";
import * as _utils from "../_utils";
import { FeatureValue, FeatureYieldValue, searchAllFeatures } from "./follow-element-computation";
import { searchAllAlternatives } from "./searchAllAlternatives";
import { wrapAllAlternatives } from "./wrapAllAlternatives";

globalThis.langium = langium;
type SuperMatch = {
  rule: langium.ParserRule;
  node: langium.CstNode;
};

type CompletionItemData = LspTypes.CompletionParams & {
  context: LspTypes.CompletionContext & {
    invokeText?: string | undefined;
  };
};

export type CompletionItemType = Omit<LspTypes.CompletionItem, "data"> & {
  data: CompletionItemData;
};

export class CompletionProviderContext {
  constructor(private root: CompletionProvider) {}
  document!: langium.LangiumDocument;
  completionItemData!: CompletionItemType["data"];
  items: CompletionItemType[] = [];
  cursorNode: langium.CstNode;
  triggerNode: langium.CstNode;
  cursorOffset: number;
  triggerOffset: number;

  acceptor = (
    value: string | langium.AstNode | langium.AstNodeDescription,
    item?: Partial<CompletionItemType>
  ) => {
    const completionItem = this.root.fillCompletionItem(
      this.document.textDocument,
      this.triggerOffset,
      value,
      {
        ...item,
        data: this.completionItemData,
      }
    );
    if (completionItem) {
      // console.log(completionItem, value, item);
      this.items.push(completionItem);
    }
  };

  setup(document: langium.LangiumDocument, params: LspTypes.CompletionParams) {
    const itemData: CompletionItemType["data"] = {
      ...params,
      context: params.context,
    };
    this.document = document;
    this.completionItemData = itemData;

    const root = document.parseResult.value;
    const cst = root.$cstNode;
    const triggerOffset = document.textDocument.offsetAt(params.position);
    if (cst) {
      const cursorOffset = triggerOffset - 1;
      const { node, inputNode } = _utils.findInputNode(cst, cursorOffset);
      const { context } = itemData;
      if (context.triggerKind === _lsp.CompletionTriggerKind.Invoked) {
        context.invokeText = node.text;
        context.triggerCharacter = void 0;
      }
      this.cursorNode = node;
      this.triggerNode = inputNode;
      this.cursorOffset = cursorOffset;
      this.triggerOffset = triggerOffset;
    } else {
      this.cursorNode = null;
      this.triggerNode = null;
      this.cursorOffset = null;
      this.triggerOffset = null;
    }
    return this;
  }
}
export class CompletionProvider extends langium.DefaultCompletionProvider {
  declare scopeProvider: References.ScopeProvider;
  declare nameProvider: References.NameProvider;
  rules: Record<string, langium.AbstractRule>;
  constructor(protected readonly services: AdvScriptServices) {
    super(services);
    this.scopeProvider = services.references.ScopeProvider;
    this.nameProvider = services.references.NameProvider;
    this.rules = services.Grammar.rules.reduce((r, rule) => ((r[rule.name] = rule), r), {});
    globalThis.Grammar = services.Grammar;
    globalThis.services = services;
    globalThis.searchAllFeatures = searchAllFeatures;
    globalThis.searchAllAlternatives = searchAllAlternatives;
    globalThis.wrapAllAlternatives = wrapAllAlternatives;
  }

  options: LspTypes.CompletionOptions = {
    triggerCharacters: TRIGGER_CHARACTERS,
  };

  currentContext = new CompletionProviderContext(this);

  setContext(document: langium.LangiumDocument, params: LspTypes.CompletionParams) {
    return this.currentContext.setup(document, params);
  }

  getContext() {
    return this.currentContext;
  }

  flushCompletionList() {
    const { textEdit, data } = this.currentContext.items[this.currentContext.items.length - 1];
    return _lsp.CompletionList.create(
      this.currentContext.items
        .splice(0)
        .filter(Boolean)
        .sort(sortWithSortText)
        .concat([
          {
            label: '"my-third-party-library"',
            kind: _lsp.CompletionItemKind.Snippet,
            documentation: "Describe your library here",
            insertTextFormat: _lsp.InsertTextFormat.Snippet,
            insertTextMode: _lsp.InsertTextMode.asIs,
            textEdit: {
              ...textEdit,
              newText:
                "[${1:LabelContent}](${2:Macro} ${3:Param} = ${4:/* InitialExpression */}| ${5:Macro}${6:Param} = ${7:/* InitialExpression */} )",
            },
            data,
          },
        ]),
      true
    );
  }

  mapApp(parseRule: langium.ParserRule, featurePoint?: langium.ParserRule) {
    let recordStart: FeatureYieldValue;
    const ruleStack: (FeatureYieldValue & { elements: FeatureYieldValue[] })[] = [];
    let ruleKeywordStack: FeatureYieldValue[], cursor: FeatureYieldValue;
    for (const rule of searchAllFeatures(
      parseRule,
      (el) => isCrossReference(el) || !ast.reflection.isSubtype(el.name, ast.Expression)
    )) {
      if (
        !recordStart &&
        langium.isRuleCall(rule.feature) &&
        (rule.name === ((featurePoint || parseRule) as langium.ParserRule).name || !featurePoint)
      ) {
        recordStart =
          rule.stack.find(
            (o) =>
              o &&
              o.kind === "ParserRule" &&
              o.name === ((featurePoint || parseRule) as langium.ParserRule).name
          ) || rule;
      }
      if (recordStart) {
        if (
          cursor &&
          ((rule.kind === "RuleCall" &&
            (rule.name === "EOL" ||
              (rule.name !== "WS" &&
                rule.stack?.length <= recordStart.stack?.length &&
                (!/_L$/.test(recordStart.name) ||
                  (/_L$/.test(recordStart.name) && !/_R$/.test(rule.name)))))) ||
            rule.stack?.length < recordStart.stack?.length)
        ) {
          ruleStack.push({ ...cursor, elements: ruleKeywordStack });
          cursor = null;
          break;
        }
        if (rule.kind === "RuleCall" || rule.kind === "CrossReference" || rule.kind === "Action") {
          if (rule.name === (recordStart.feature as langium.ParserRule).name) {
            cursor = null;
            break;
          }
          if (ruleKeywordStack) {
            const next = ruleKeywordStack.splice(0);
            // if (
            //   ruleStack.length > 0 &&
            //   ruleStack[ruleStack.length - 1]?.features.length === 0
            // ) {
            //   break;
            // }
            ruleStack.push({ ...cursor, elements: next });
          } else {
            ruleKeywordStack = [];
          }
          cursor = rule;
        } else {
          ruleKeywordStack.push(rule);
        }
      }
    }
    if (cursor) {
      ruleStack.push({ ...cursor, elements: ruleKeywordStack });
    }
    return (
      ruleStack.length > 0 &&
      (Object.assign(ruleStack, {
        parseRule,
        featurePoint,
      }) as (FeatureValue & {
        stack: FeatureValue[];
      } & {
        elements: FeatureYieldValue[];
      })[])
    );
  }

  toKey(feature: langium.Keyword | langium.CrossReference) {
    if (isKeyword(feature)) {
      return feature.value.replace(/,/g, "\\,");
    } else {
      return feature.type.$refText;
    }
  }

  to(stacks: ReturnType<CompletionProvider["mapApp"]>) {
    return stacks.map((o, index) => {
      try {
        index++;
        // return o
        const cardinality = (o.stack.find((o) => o.kind === "Assignment")?.feature as Assignment)
          ?.cardinality;
        const features = o.elements
          .map((o) => o.kind === "Keyword" && (o.feature as langium.Keyword))
          .filter(Boolean);
        if (features.length === 0) {
          if (o.kind === "RuleCall" && o.name === "WS") {
            return " ";
          } else {
            return `\${${index}:${o.name}}`;
          }
        } else if (features.length === 1) {
          return this.toKey(features[0]);
        }
        return `\${${index}|${cardinality === "?" ? " ," : ""}${features
          .map((feature) => this.toKey(feature))
          .join(",")}|}`;
      } catch (error) {
        return error.message;
      }
    });
  }

  getCompletion(
    document: langium.LangiumDocument,
    params: LspTypes.CompletionParams
  ): langium.MaybePromise<LspTypes.CompletionList> {
    return this.getCompletionInternal(document, params);
  }
  getCompletionInline(
    document: langium.LangiumDocument,
    params: LspTypes.CompletionParams
  ): langium.MaybePromise<LspTypes.CompletionList> {
    return this.getCompletionInternal(document, params, (node) => langium.isCrossReference(node));
  }
  private getCompletionInternal(
    document: langium.LangiumDocument,
    params: LspTypes.CompletionParams,
    filter?: (node: langium.AbstractElement | langium.CrossReference) => boolean
  ): langium.MaybePromise<LspTypes.CompletionList> {
    printCompletionParams(params);
    const { cursorNode, triggerNode, cursorOffset, triggerOffset } = this.setContext(
      document,
      params
    );
    // 确保解析错误的节点不会影响
    if (
      cursorNode &&
      (isNaN(cursorNode.end) ||
        !(isCrossReference(cursorNode.feature) || isKeyword(cursorNode.feature)) ||
        cursorNode.end <= triggerOffset)
    ) {
      const commonSuperStack: SuperMatch[] = this.buildCommonSuperRuleStack(cursorNode);
      const commonSuperRule: SuperMatch = this.findCommonSuperRule(cursorNode);
      if (commonSuperRule) {
        // node = this.wrapAstNode(commonSuperRule, node, prevTokenOffset);
        console.groupCollapsed("input features");
        console.log(
          "node",
          JSON.stringify(cursorNode.text),
          cursorOffset,
          cursorNode,
          // this.isStringFeature(triggerNode.feature),
          langium.findRelevantNode(cursorNode)
        );
        console.log(
          "commonSuperStack",
          commonSuperStack.map((stack) => ({ ...stack, ...langium.findAllFeatures(stack.rule) }))
        );
        for (const o of commonSuperStack) {
          console.log(
            "commonSuperStack",
            "feature:",
            o.node.feature,
            "type:",
            o.node.element.$type,
            "rule:",
            o.rule,
            langium.findAllFeatures(o.rule)
          );
        }
        const superNode = commonSuperStack[0];
        const containterNode = commonSuperStack[1] || commonSuperRule;
        console.log(
          "commonSuperRule",
          commonSuperRule
          // findLeafNodeAtOffset(commonSuperRule.node, cursorOffset)
        );
        // const nextNode = _utils.findNextTokenNode(commonSuperRule.node, prevTokenOffset);
        // console.log("nextNode", nextNode);
        const stackNode =
          (_utils.isParserRuleOrCrossReference(cursorNode.feature) &&
            _utils.findNodeWithFeature(commonSuperRule.node, cursorNode.feature)) ||
          cursorNode;
        const featureStack = this.buildFeatureStack(stackNode);
        // const featureStack2 = this.buildFeatureStack(node);
        console.log("featureStack", [...featureStack], stackNode, cursorNode);
        const features = langium.findNextFeatures(featureStack);
        // const features2 = [...fer.findNextFeatures(featureStack2)];
        console.log("input features", features);
        // In some cases, it is possible that we do not have a super rule
        if (commonSuperRule) {
          const flattened = Array.from(_utils.flattenCstGen(commonSuperRule.node)).filter(
            (e) => e.offset < triggerOffset
          );
          const possibleFeatures = this.ruleInterpreter.interpretRule(
            commonSuperRule.rule,
            [...flattened],
            cursorOffset
          );
          const tokens = this.services.parser.LangiumParser._wrapper.input.filter(
            (o) => o.endOffset < triggerOffset
          );
          console.log(
            "getCompletion",
            cursorOffset,
            cursorNode.text,
            flattened, //.map((f) => f.feature.$type + ":" + f.text).join("|"),
            // possibleFeatures
            tokens,
            this.services.parser.LangiumParser._wrapper.computeContentAssist("Document", tokens)
          );
          // console.log(
          //   "findAllFeatures",
          //   // _utils.findAllFeatures(commonSuperRule.rule),
          //   // langium.findNextFeatures(this.buildFeatureStack(node)),
          //   fer.findAllFeatures(commonSuperRule.rule)
          //   // langium.findAllFeatures(commonSuperRule.rule).byName
          // );
          // Remove features which we already identified during parsing
          const partialMatches = possibleFeatures.filter((e) => {
            const match = this.ruleInterpreter.featureMatches(
              e,
              flattened[flattened.length - 1],
              triggerOffset
            );
            return match === "partial" || match === "both";
          });
          // console.log("partialMatches", partialMatches, [...features]);
          const notMatchingFeatures = possibleFeatures.filter((e) => !partialMatches.includes(e));
          features.push(...partialMatches);
          const nextFeatures = langium.findNextFeatures(notMatchingFeatures.flatMap((e) => [e]));
          // console.log("notMatchingFeatures => nextFeatures", notMatchingFeatures, nextFeatures, [
          //   ...features,
          // ]);
          features.push(...nextFeatures);
        }
        if (
          cursorNode.end === triggerOffset &&
          cursorNode.text !== params.context.triggerCharacter
        ) {
          // console.log("push feature", node.feature);
          features.push(cursorNode.feature);
        }
        // const contextNode = this.getCompletetionContext(node);
        // console.log("contextNode", contextNode);
        console.groupEnd();
        const includesFeature = [];
        const featureStream: langium.Stream<langium.AbstractElement | langium.CrossReference> =
          langium.stream(features).distinct((e) => (langium.isKeyword(e) ? e.value : e));
        for (const feature of featureStream) {
          includesFeature.push(feature);
          if (this.isIgnoreFeature(feature) || (filter && !filter(feature))) {
            continue;
          }
          const parseRule = langium.isRuleCall(feature)
            ? feature.rule.ref
            : langium.getContainerOfType(feature, _utils.isParserRuleOrCrossReference);
          const allowNode = commonSuperStack.find((stack) => {
            const allRules = Array.from(langium.findAllFeatures(stack.rule).byFeature.keys());
            return allRules.find(
              (o) => o === parseRule || (langium.isRuleCall(o) && o.rule?.ref === parseRule)
            );
          });
          const map = commonSuperStack.map((stack) =>
            this.mapApp(stack.rule, parseRule as langium.ParserRule)
          );
          const snip = map.filter(Boolean);
          console.log(
            "allowNode",
            feature,
            allowNode,
            snip,
            snip.map((stacks) => this.to(stacks)),
            commonSuperStack.map((stack) => Array.from(searchAllFeatures(stack.node.feature)))
          );
          if (parseRule && _utils.isParserRuleOrCrossReference(parseRule)) {
            // findAllFeatures;
            const keywordFeatureNode =
              (allowNode || langium.isCrossReference(parseRule)) &&
              _utils.findNodeWithFeature(
                allowNode?.node || commonSuperRule.node,
                parseRule
                // cursorOffset
              );
            // _utils.findNodesWithFeature(
            //   commonSuperRule.node.element.$container.$cstNode,
            //   parseRule
            // );
            if (keywordFeatureNode) {
              if (langium.isCrossReference(parseRule)) {
                if (keywordFeatureNode.end > triggerOffset) {
                  console.log("skip overoffset reference", keywordFeatureNode);
                  continue;
                }
                const isReferenceTrigger = isCrossReference(triggerNode.feature);
                const isCursorTriggerNode =
                  triggerOffset <= triggerNode.end && triggerOffset > triggerNode.offset;
                if (isReferenceTrigger && isCursorTriggerNode && triggerNode.feature !== parseRule)
                  continue;
                const isCursorReference: boolean =
                  isReferenceTrigger && isCursorTriggerNode && triggerNode.feature === parseRule;
                const refId = this.getCrossReferenceProperty(parseRule) as string;
                const refNode = isCursorReference ? triggerNode : keywordFeatureNode;
                const finded = this.findArrayAssignment(refNode, superNode.node);
                console.log("findArrayAssignment", finded, keywordFeatureNode);
                const reference = refNode.element[refId];
                const resolvedRef = langium.isReference(reference) && !reference.error;
                if (finded) {
                  const { assignment, container } = finded;
                  const nodeList = (container.element[assignment.feature] || []) as any[];
                  if (isCursorReference && resolvedRef) {
                    console.log(
                      "skip resolved reference",
                      parseRule.type.$refText,
                      reference,
                      keywordFeatureNode
                    );
                    continue;
                  }
                  const cacheMap = nodeList.reduce((result, node: unknown) => {
                    const resolvedNode = isReference(node[refId]) && (node[refId] as Reference).ref;
                    const name =
                      resolvedNode &&
                      this.nameProvider.getQualifiedName(resolvedNode.$container, resolvedNode);
                    if (name) {
                      result[name] = true;
                    }
                    return result;
                  }, {});
                  console.log(
                    "skip resolved reference",
                    parseRule.type.$refText,
                    Object.keys(cacheMap),
                    container
                  );
                  for (const { node, info } of this.forCompletionForCrossReference(
                    parseRule,
                    finded?.container.element || containterNode.node.element
                  )) {
                    if (
                      // (node.type === ast.Param || node.type === ast.Character) &&
                      !cacheMap[node.name]
                    ) {
                      console.log(node, info);
                      this.currentContext.acceptor(node, info);
                    }
                  }
                } else {
                  if (resolvedRef) {
                    // commonSuperStack.find(superNode => {

                    // })
                    console.log(
                      "skip resolved reference",
                      parseRule.type.$refText,
                      reference,
                      keywordFeatureNode
                    );
                    continue;
                  }
                  this.completionForCrossReference(
                    parseRule,
                    finded?.container.element || containterNode.node.element,
                    this.currentContext.acceptor
                  );
                }
                continue;
              } else if (!isNaN(keywordFeatureNode.offset)) {
                const finded = this.findArrayAssignment(cursorNode, superNode.node);
                console.log("findArrayAssignment", finded, keywordFeatureNode);
                const group = _utils.getContainerOfTypeUntil(
                  keywordFeatureNode.feature,
                  (node): node is langium.Group => {
                    return (
                      langium.isGroup(node) &&
                      (node.cardinality === "*" || node.cardinality === "+")
                    );
                  },
                  (node) => node === containterNode.node.feature
                );
                if (isKeyword(feature)) {
                  if (keywordFeatureNode.text === feature.value && !group) {
                    console.log("skip keyword", feature, parseRule, keywordFeatureNode);
                    continue;
                  }
                } else {
                  if (!group) {
                    console.log("skip exsist feature", feature, parseRule, keywordFeatureNode);
                    continue;
                  }
                }
              }
            } else {
              console.log("not find feature", feature, "in", commonSuperRule.node);
            }
            console.log("completionFor", feature);
            this.completionFor(
              langium.findRelevantNode(cursorNode),
              feature,
              this.currentContext.acceptor
            );
            continue;
          }
          console.log("completionFor", feature);
          this.completionFor(
            langium.findRelevantNode(cursorNode),
            feature,
            this.currentContext.acceptor
          );
        }
        // console.log("features", includesFeature);
      } else {
        // The entry rule is the first parser rule
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        // this.completionForRule(undefined, void 0, this.currentContext.acceptor);
      }
    }
    return this.flushCompletionList();
  }

  protected completionForRule(
    astNode: langium.AstNode | undefined,
    rule: langium.AbstractRule | string = this.grammar.rules.find((e) => langium.isParserRule(e)),
    acceptor: langium.CompletionAcceptor
  ): void {
    if (typeof rule === "string") {
      rule = this.grammar.rules.find((o) => o.name === rule);
    }
    rule && super.completionForRule(astNode, rule, acceptor);
  }

  protected isArrayAssignmentFeature(assignment: langium.Assignment) {
    const isArrayAssignment = assignment?.operator === "+=";
    if (!isArrayAssignment && assignment) {
      if (langium.isRuleCall(assignment.terminal)) {
        return assignment.terminal.rule.ref.type === "ArrayList";
      }
    }
    return isArrayAssignment;
  }

  findArrayAssignment(
    cstNode: CstNode,
    until: CstNode = isCrossReference(cstNode.feature)
      ? cstNode.element.$container.$cstNode
      : cstNode.element.$cstNode
  ): { assignment: Assignment; container: CstNode } | undefined {
    let n: CstNode | undefined = cstNode;
    do {
      const assignment = getContainerOfTypeUntil(n.feature, isAssignment, (node) =>
        isParserRule(node)
      );
      if (assignment && this.isArrayAssignmentFeature(assignment)) {
        return { assignment, container: n.parent };
      }
      if (n === until) {
        // return { assignment, container: n };
        return;
      }
      n = n.parent;
    } while (n);
  }

  protected buildFeatureStack(node: langium.CstNode | undefined): langium.AbstractElement[] {
    const features: langium.AbstractElement[] = [];
    while (node) {
      if (node.feature) {
        features.push(node.feature);
      }
      node = node.parent;
    }
    return features;
  }

  protected isIgnoreFeature(feature: langium.AbstractElement) {
    if (langium.isKeyword(feature)) {
      return (
        langium.isParserRule(feature.$container) &&
        /^Operator_(?!Equal(?=$)).+$/.test(feature.$container.name)
      );
    }
    if (langium.isRuleCall(feature)) {
      const rule = feature.rule.ref;
      return langium.isTerminalRule(rule);
    }
    return false;
  }

  private getCompletetionContext(astNode: langium.CstNode) {
    return langium.getContainerOfType(astNode.element, this.isTopExpression)?.$cstNode;
  }

  protected findCommonSuperRule(node: langium.CstNode): SuperMatch | undefined {
    const fineded = _utils.findCommonSuperRule(node, (node) => this.getCompletetionContext(node));
    return fineded; //?? super.findCommonSuperRule(node);
  }

  protected buildCommonSuperRuleStack(node: langium.CstNode): SuperMatch[] {
    const features: Map<AstNode, SuperMatch[]> = new Map();
    let prev: langium.CstNode;
    while (node) {
      if (node.element && this.isContainerExpression(node.element)) {
        // if (!features.has(node.element)) {
        const track = features.get(node.element) || [];
        if (langium.isRuleCall(node.feature) && node.feature.rule.ref) {
          const rule = <langium.ParserRule>node.feature.rule.ref;
          features.set(node.element, [...track, { rule, node }]);
        }
        // }
        prev = node;
      } else if (prev) {
        break;
      }
      node = node.parent;
    }
    const result = Array.from(features.values()).flat(1);
    // result.push(super.findCommonSuperRule(result[result.length - 1].node));
    return result;
  }

  isTopExpression = (astNode: unknown): astNode is langium.AstNode => {
    return this.isContainerExpression(astNode) && !this.isContainerExpression(astNode.$container);
  };

  isContainerExpression = (astNode: unknown): astNode is langium.AstNode => {
    return (
      ast.isTemplate(astNode) ||
      ast.isCall(astNode) ||
      ast.isDialog(astNode) ||
      ast.isCharacter(astNode) ||
      ast.isMacro(astNode) ||
      ast.isParam(astNode) ||
      ast.isMacroParam(astNode) ||
      ast.isExpression(astNode) ||
      // ast.isTitlePage(astNode) ||
      ast.isVariable(astNode) ||
      ast.isMacroPipe(astNode) ||
      ast.isList(astNode)
      // ast.isDocumentContents(astNode) ||
      // ast.isCharactersDeclare(astNode) ||
      // ast.isLogicBlock_IF(astNode) ||
      // ast.isLogicStatment(astNode) ||
    );
  };

  private wrapAstNode(
    commonSuperRule: {
      rule: langium.ParserRule;
      node: langium.CstNode;
    },
    node: langium.CstNode,
    prevTokenOffset: number
  ) {
    if (langium.isCrossReference(node.feature)) {
      const refProp = this.getCrossReferenceProperty(node.feature);
      const ref = refProp && node.element[refProp];
      console.log("isCrossReference", refProp, ref, prevTokenOffset);
      if (prevTokenOffset >= node.offset && prevTokenOffset < node.end && node.length > 1) {
        return void 0;
      } else if (langium.isReference(ref) && !ref.ref) {
        node = _utils.findPrevTokenNode(commonSuperRule.node);
        console.log("node => prev", node);
        return node;
      }
    }
    return node;
  }

  protected completionFor(
    astNode: langium.AstNode | undefined,
    feature: langium.AbstractElement,
    acceptor: langium.CompletionAcceptor
  ): void {
    if (langium.isRuleCall(feature) && langium.isTerminalRule(feature.rule.ref)) {
      this.completionForTerminalRule(astNode, feature.rule.ref, acceptor);
    } else {
      super.completionFor(astNode, feature, acceptor);
    }
  }
  protected completionForKeyword(
    keyword: langium.Keyword,
    context: langium.AstNode | undefined,
    acceptor: langium.CompletionAcceptor
  ): void {
    const [match, type, name] =
      (isParserRule(keyword.$container) && /(.+?)_(.+)/.exec(keyword.$container.name)) || [];
    switch (type) {
      case "Const":
        return acceptor(keyword.value, {
          kind: _lsp.CompletionItemKind.Keyword,
          detail: type,
          sortText: "3",
          documentation: name,
        });
    }
    return acceptor(keyword.value, {
      kind: _lsp.CompletionItemKind.Keyword,
      detail: "Keyword",
      sortText: /\w/.test(keyword.value) ? "1" : "2",
    });
  }

  protected completionForTerminalRule(
    astNode: langium.AstNode | undefined,
    feature: langium.TerminalRule,
    acceptor: langium.CompletionAcceptor
  ): void {
    console.log(
      "completionForTerminalRule",
      feature,
      this.services.parser.LangiumParser._lexer.lexerDefinitionErrors
    );
  }

  getCrossReferenceProperty(crossRef: langium.CrossReference): string | void {
    const assignment = langium.getContainerOfType(crossRef, langium.isAssignment);
    if (assignment) {
      return assignment.feature;
    }
  }

  *forCompletionForCrossReference(
    crossRef: langium.CrossReference,
    context: langium.AstNode
  ): Generator<{
    node: langium.AstNodeDescription;
    info: Partial<LspTypes.CompletionItem>;
  }> {
    const refId = _utils.findPropertyId(crossRef);
    if (refId) {
      const scope = this.scopeProvider.getScope(context, refId);
      const contextNameNode = this.nameProvider.getNameNode(context);
      let parentRef: langium.AstNodeDescription;
      console.groupCollapsed("completionForCrossReference", crossRef, refId, context, [
        ...scope.getAllElements(),
      ]);
      const duplicateStore = new Set<string>();
      if (
        contextNameNode &&
        langium.isCrossReference(contextNameNode.feature)
        // &&
        // contextNameNode.feature !== crossRef
      ) {
        const containerRefId = _utils.findPropertyId(contextNameNode.feature);
        const refType = this.services.shared.AstReflection.getReferenceType(containerRefId);
        if (
          this.services.shared.AstReflection.isSubtype(refType, ast.Character) ||
          this.services.shared.AstReflection.isSubtype(refType, ast.Macro)
        ) {
          const ref = this.services.references.Linker.getCandidateWithCache(contextNameNode);
          console.log(containerRefId, ref);
          if (!isLinkingError(ref)) {
            parentRef = ref;
          }
          // scope.filterElementWith(walker)
        }
      }
      for (const node of scope.getAllElements()) {
        if (!duplicateStore.has(node.name)) {
          if (!parentRef || node.name.indexOf(parentRef.name) > -1) {
            yield {
              node,
              info: {
                kind: _lsp.CompletionItemKind.Reference,
                detail: node.type,
                sortText: "0",
                commitCharacters: ["="],
                insertTextFormat: 2,
              },
            };
          }
          duplicateStore.add(node.name);
        }
      }
      console.groupEnd();
    }
  }

  completionForCrossReference(
    crossRef: langium.CrossReference,
    context: langium.AstNode,
    acceptor: langium.CompletionAcceptor
  ): void {
    const refId = _utils.findPropertyId(crossRef);
    if (refId) {
      const scope = this.scopeProvider.getScope(context, refId);
      const contextNameNode = this.nameProvider.getNameNode(context);
      console.groupCollapsed("completionForCrossReference", crossRef, refId, context, [
        ...scope.getAllElements(),
      ]);
      const duplicateStore = new Set<string>();
      if (
        contextNameNode &&
        langium.isCrossReference(contextNameNode.feature)
        // &&
        // contextNameNode.feature !== crossRef
      ) {
        const containerRefId = _utils.findPropertyId(contextNameNode.feature);
        const refType = this.services.shared.AstReflection.getReferenceType(containerRefId);
        if (
          this.services.shared.AstReflection.isSubtype(refType, ast.Character) ||
          this.services.shared.AstReflection.isSubtype(refType, ast.Macro)
        ) {
          const parentRef = this.services.references.Linker.getCandidateWithCache(contextNameNode);
          console.log(containerRefId, parentRef);
          if (!isLinkingError(parentRef)) {
            for (const node of scope.filterElementWith(
              (p) => p.name.indexOf(parentRef.name) > -1
            )) {
              if (!duplicateStore.has(node.name)) {
                acceptor(node, {
                  kind: _lsp.CompletionItemKind.Reference,
                  detail: node.type,
                  sortText: "0",
                  commitCharacters: ["="],
                  insertTextFormat: 2,
                });
                duplicateStore.add(node.name);
              }
            }
            console.groupEnd();
            return;
          }
          // scope.filterElementWith(walker)
        }
      }
      for (const node of scope.getAllElements()) {
        if (!duplicateStore.has(node.name)) {
          acceptor(node, {
            kind: _lsp.CompletionItemKind.Reference,
            detail: node.type,
            sortText: "0",
            commitCharacters: ["="],
            insertTextFormat: 2,
          });
          duplicateStore.add(node.name);
        }
      }
      console.groupEnd();
    }
  }

  async resolveCompletionItem(document: langium.LangiumDocument, item: CompletionItemType) {
    console.group("resolveCompletionItem");
    console.log("CompletionItem", item);
    const { context } = item.data;
    if (context.triggerKind === _lsp.CompletionTriggerKind.Invoked) {
      const { textEdit } = item;
      const { range, newText } = textEdit as LspTypes.TextEdit;
      const invokeText = context.invokeText || this.getInvokeNode(document, item);
      console.log("ResolveInputNode", JSON.stringify(invokeText));
      if (
        item.kind !== _lsp.CompletionItemKind.Keyword &&
        newText.toLowerCase().indexOf(invokeText.toLowerCase()) !== 0
      ) {
        console.log("replace matched text", invokeText);
        item.additionalTextEdits = [
          ...(item.additionalTextEdits || []),
          this.buildDelete(range, invokeText.length),
        ];
      }
    }
    console.groupEnd();
    return item;
  }

  private getInvokeNode(document: langium.LangiumDocument, item: CompletionItemType) {
    const { parseResult } = document;
    const inputOffset = document.textDocument.offsetAt(
      (item.data as LspTypes.CompletionParams).position
    );
    const prevTokenOffset = inputOffset - 1;
    const { node } = _utils.findInputNode(parseResult.value.$cstNode, prevTokenOffset);
    const { text: invokeText } = node;
    return invokeText;
  }

  fillCompletionItem(
    document: LspTypes.TextDocument,
    offset: number,
    value: string | langium.AstNode | langium.AstNodeDescription,
    info: Partial<CompletionItemType>
  ): CompletionItemType | undefined {
    let label: string;
    if (typeof value === "string") {
      label = value;
    } else if (langium.isAstNode(value) && this.nameProvider.isNamed(value)) {
      label = this.nameProvider.getName(value);
    } else if (!langium.isAstNode(value)) {
      label = value.name;
    } else {
      return undefined;
    }
    // label = label.replace(/(.*?\(.+\))/g, "")
    let prefix: string;
    const inputName = label.replace(/^(.*?\(.+\))/g, (_, replace) => {
      prefix = replace;
      return "";
    });
    const textEdit = this.buildCompletionTextEdit(document, offset, inputName);
    if (!textEdit) {
      return undefined;
    }
    const item = {
      label: (prefix?.replace(/\(((?!\)).)*?\)$/, "") ?? "") + inputName,
      textEdit,
      documentation: "documentation",
    } as CompletionItemType;
    if (info) {
      Object.assign(item, info);
    }
    return item;
  }

  protected buildDelete(range: LspTypes.Range, length: number = 0): LspTypes.TextEdit | undefined {
    return {
      newText: "",
      range: {
        start: {
          line: range.start.line,
          character: range.start.character - length,
        },
        end: range.end,
      },
    };
  }
}

export const TRIGGER_CHARACTERS = [
  "=",
  ":",
  "@",
  ".",
  "\n",
  ",",
  "*",
  " ",
  "]",
  ")",
  "|",
  "/",
  "[",
  "{",
  "(",
  "",
  "%",
  "$",
];

export function sortWithSortText(a: LspTypes.CompletionItem, b: LspTypes.CompletionItem): number {
  if (typeof a.sortText === "string" && typeof b.sortText === "string") {
    return a.sortText.localeCompare(b.sortText);
  }
  // 含有sortText的权重的一方将被推到顶端
  // @ts-ignore
  return !a.sortText - !b.sortText; // 利用隐式转换, true: 1, false: 0，等同于（!!b.sortText - !!a.sortText）
}

function printCompletionParams(params: LspTypes.CompletionParams) {
  console.log(
    "params",
    params.position,
    getCompletionKindTypeName(params),
    JSON.stringify(params.context.triggerCharacter)
  );
}

function getCompletionKindTypeName(params: LspTypes.CompletionParams): any {
  return Object.entries(_lsp.CompletionTriggerKind).find(
    (o) => o[1] === params.context.triggerKind
  )?.[0];
}

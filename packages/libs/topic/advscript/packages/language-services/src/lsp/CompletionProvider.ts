/* eslint-disable no-useless-catch */
import * as langium from "langium";
import { AdvScriptServices } from "../advscript-module";
import * as ast from "../ast-utils";
import type * as References from "../references";
import type { LspTypes } from "../_lsp";
import * as _lsp from "../_lsp";
import * as _utils from "../_utils";
import { CompletionItemType, CompletionProviderContext } from "./CompletionProviderContext";
import { FeatureCrossReference, searchAllFeatures } from "./follow-element-computation";
import { RuleInterpreter } from "./RuleInterpreter";
import { searchAllAlternatives } from "./searchAllAlternatives";
import {
  FeatureData,
  filterRuleTreeEnums,
  generateRuleTreeEnum,
  filterRuleTree,
  toSnippet,
  ruleFeatures2Element,
} from "./wrapAllAlternatives";

globalThis.langium = langium;
type SuperMatch = {
  rule: langium.ParserRule;
  node: langium.CstNode;
  feature: langium.RuleCall;
};

type getCompletionInternalParam = {
  filterFeature?: (node: langium.AbstractElement | langium.CrossReference) => boolean;
  strict?: boolean;
};

export class CompletionProvider extends langium.DefaultCompletionProvider {
  declare scopeProvider: References.ScopeProvider;
  declare nameProvider: References.NameProvider;
  declare reflection: langium.AstReflection & ast.AdvScriptAstReflection;
  declare ruleInterpreter: RuleInterpreter;
  constructor(protected readonly services: AdvScriptServices) {
    super(services);
    this.scopeProvider = services.references.ScopeProvider;
    this.nameProvider = services.references.NameProvider;
    this.reflection = services.shared.AstReflection;
    globalThis.Grammar = services.Grammar;
    globalThis.services = services;
    globalThis.searchAllFeatures = searchAllFeatures;
    globalThis.searchAllAlternatives = searchAllAlternatives;
    globalThis.wrapAllAlternatives = this.ruleInterpreter.wrapAllAlternatives;
    globalThis.currentContext = this.currentContext;
    this.services.shared.AstReflection;
  }

  options: LspTypes.CompletionOptions = {
    triggerCharacters: TRIGGER_CHARACTERS,
  };

  currentContext = new CompletionProviderContext(this);

  setContext(
    document: langium.LangiumDocument,
    params: LspTypes.CompletionParams,
    strict?: boolean
  ) {
    return this.currentContext.setup(document, params, strict);
  }

  getContext() {
    return this.currentContext;
  }

  async flushCompletionList() {
    return _lsp.CompletionList.create(this.currentContext.flush(), true);
  }

  async flushInlineCompletionList() {
    return _lsp.CompletionList.create(await this.currentContext.flushInline());
  }

  getCompletion(
    document: langium.LangiumDocument,
    params: LspTypes.CompletionParams
  ): langium.MaybePromise<LspTypes.CompletionList> {
    return this.trace("getCompletion", () => {
      this.getCompletionInternal(document, params, {
        filterFeature: (node) => langium.isCrossReference(node),
      });
      return this.flushCompletionList();
    });
  }

  trace<T>(name: string | [string, ...any[]], handle: () => T, collapsed = true): T {
    try {
      name = name instanceof Array ? name : [name];
      collapsed ? console.groupCollapsed(...name) : console.group(...name);
      return handle();
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  async getCompletionInline(
    document: langium.LangiumDocument,
    params: LspTypes.CompletionParams
  ): Promise<LspTypes.CompletionList> {
    return this.trace("getCompletionInline", async () => {
      await this.getCompletionInternal(document, params, {
        filterFeature: (node) => langium.isCrossReference(node),
        strict: true,
      });
      return this.flushInlineCompletionList();
    });
  }

  sty = [ast.StoryBlock, ast.Call, ast.DialogCall, ast.ModifierList_Dialog];

  async getProvideSignatureHelp(
    document: langium.LangiumDocument,
    params: LspTypes.SignatureHelpParams
  ) {
    console.log("doProvideSignatureHelp", params);
    return {
      signatures: [
        {
          label: "test",
          documentation: "测试",
          parameters: [
            {
              label: "a",
              documentation: {
                kind: _lsp.MarkupKind.Markdown,
                value: ["# Header", "## Abc"].join("\n"),
              },
            },
          ],
        },
      ],
      activeParameter: 0,
      activeSignature: 0,
    } as LspTypes.SignatureHelp;
  }

  private getCompletionInternal(
    document: langium.LangiumDocument,
    params: LspTypes.CompletionParams,
    config?: getCompletionInternalParam
  ) {
    printCompletionParams(params);
    const { cursorNode, triggerNode, triggerOffset } = this.setContext(
      document,
      params,
      config?.strict
    );
    let commonSuperStack: SuperMatch[];
    // 确保解析错误的节点不会影响
    if (
      cursorNode &&
      (isNaN(cursorNode.end) ||
        !(langium.isCrossReference(cursorNode.feature) || langium.isKeyword(cursorNode.feature)) ||
        cursorNode.end <= triggerOffset)
    ) {
      commonSuperStack = this.buildCommonSuperRuleStack(cursorNode);
      // commonSuperRule = this.findCommonSuperRule(cursorNode);
    }
    this.printDebug(commonSuperStack);
    const includesRules = {};
    if (commonSuperStack?.length) {
      const snipValues = {};
      let prevRuleCall: langium.RuleCall,
        includes = false;
      console.log("findLeafNodeAtOffsetStrict", triggerNode);
      const refs = {} as Record<
        string,
        FeatureData<FeatureCrossReference> & {
          assignment?: langium.Assignment;
          container?: langium.CstNode;
        }
      >;
      for (const { node, rule, feature } of commonSuperStack) {
        if (this.isIgnoreFeature(node.feature) || triggerNode.feature === rule.alternatives) {
          prevRuleCall = feature;
          continue;
        }
        console.log("type:", node.element.$type, "rule:", rule.name, "feature:", node.feature);
        if (node || this.sty.includes(rule.name)) {
          console.groupCollapsed("wrapAllAlternatives");
          includesRules[rule.name] = true;
          const { snippets, references } = this.ruleInterpreter.wrapAllAlternatives(rule, {
            root: rule,
            node: prevRuleCall ? node : cursorNode,
            triggerNode,
            prevRule: prevRuleCall,
          });
          for (const ref of references) {
            if (!refs[ref.name]) {
              const finded = this.findArrayAssignment(cursorNode, node);
              refs[ref.name] = {
                ...ref,
                ...finded,
              };
              console.log("findArrayAssignment", finded, cursorNode);
            }
          }
          console.log("snippets", snippets);
          for (const snippet of snippets) {
            if (!snipValues[snippet.value]) {
              this.currentContext.acceptor(snippet.value, {
                label: snippet.preview,
                kind: _lsp.CompletionItemKind.Snippet,
                documentation: snippet.preview,
                insertTextFormat: _lsp.InsertTextFormat.Snippet,
                insertTextMode: _lsp.InsertTextMode.asIs,
                sortText: "5",
                // commitCharacters: [], //[" ", snippet.prefixText?.[0]].filter(Boolean),
                detail: snippet.label,
                command: {
                  title: "",
                  command: _lsp.COMMAND_ID.TriggerParameterHints,
                },
              });
              snipValues[snippet.value] = true;
            }
          }
          if (includes && Object.keys(snipValues).length === 0) {
            // break;
          } else {
            includes = true;
            // break;
          }

          const treeEnums = [
            ...filterRuleTreeEnums(
              rule,
              {
                root: rule,
                node: prevRuleCall ? node : cursorNode,
                triggerNode,
                prevRule: prevRuleCall,
              },
              true
            ),
          ];
          const cstNodes = [..._utils.flattenCstGen(node)];
          console.log("filterRuleTreeEnums", rule.name, references, snippets, treeEnums);
          console.log(
            "interpretWithFeatures",
            [
              ...filterRuleTree(rule, {
                root: rule,
                node: prevRuleCall ? node : cursorNode,
                triggerNode,
                prevRule: prevRuleCall,
              }),
            ].map((features) => {
              const r = this.ruleInterpreter.interpretWithFeatures(
                features,
                cstNodes,
                triggerOffset
              );
              return Object.assign(
                toSnippet(
                  ruleFeatures2Element(r, {
                    root: rule,
                    node: prevRuleCall ? node : cursorNode,
                    triggerNode,
                    prevRule: prevRuleCall,
                  })
                ),
                { elements: r }
              );
            })
          );

          console.groupEnd();
        }
        prevRuleCall = feature;
      }
      for (const { feature, assignment, container } of Object.values(refs)) {
        if (params.context?.triggerKind !== _lsp.CompletionTriggerKind.Invoked) {
          const isReferenceTrigger = langium.isCrossReference(cursorNode.feature);
          const isCursorReference: boolean = isReferenceTrigger && cursorNode.feature === feature;
          if (isCursorReference) {
            const refId = this.getCrossReferenceProperty(feature) as string;
            const reference = cursorNode.element[refId];
            const resolvedRef = langium.isReference(reference) && !reference.error;
            if (isCursorReference && resolvedRef) {
              console.log("skip resolved reference", reference);
              continue;
            }
          }
        }
        const { elements, cacheMap, refText } = this.resolveReferences(
          feature,
          cursorNode.element,
          assignment,
          container
        );
        console.log(
          "skip resolved reference",
          feature.type.$refText,
          elements,
          Object.keys(cacheMap),
          container
        );
        console.log("filterRuleTreeEnums", refText);
        for (const { node, info } of this.forCompletionForCrossReference(
          feature,
          cursorNode.element
        )) {
          if (!cacheMap[node.name]) {
            // console.log(node, info);
            this.currentContext.acceptorRef(node, info);
          }
        }
      }
    }
    // if (!config?.filterFeature) {
    //   commonSuperRule = commonSuperRule || super.findCommonSuperRule(cursorNode);
    //   if (!commonSuperStack.length) commonSuperStack = [commonSuperRule];
    // }
    // if (this.currentContext.isKeywordTrigger() && !this.currentContext.isEOLTrigger()) {
    //   console.groupCollapsed("wrapAllAlternatives");
    //   for (const type of this.sty) {
    //     if (!includesRules[type]) {
    //       const snippets = wrapAllAlternatives(this.rules[type], {
    //         crossrefs: (type, feature) => {
    //           const wrapped = Array.from(
    //             this.forCompletionForCrossReference(feature, cursorNode.element)
    //           );
    //           console.log(wrapped);
    //           return wrapped.map(
    //             (o) => this.currentContext.getReferenceName(o.node)?.label || o.node.name
    //           );
    //         },
    //       });
    //       console.log("snippets", snippets);
    //       for (const snippet of snippets) {
    //         this.currentContext.acceptor(snippet.value, {
    //           label: snippet.preview,
    //           kind: _lsp.CompletionItemKind.Snippet,
    //           documentation: snippet.preview,
    //           insertTextFormat: _lsp.InsertTextFormat.Snippet,
    //           insertTextMode: _lsp.InsertTextMode.asIs,
    //           sortText: "0",
    //           filterText: snippet.preview,
    //           commitCharacters: [], //[" ", snippet.prefixText?.[0]].filter(Boolean),
    //           detail: snippet.label,
    //           command: {
    //             title: "",
    //             command: _lsp.COMMAND_ID.TriggerParameterHints,
    //           },
    //         });
    //       }
    //     }
    //   }
    //   console.groupEnd();
    // }
    // this.completionWithFeatures(commonSuperStack, commonSuperRule, config);
  }
  private resolveReferences(
    feature: langium.CrossReference & {
      assignment?: langium.Assignment;
      source?: langium.AbstractElement;
    },
    cursorNode: langium.AstNode,
    assignment: langium.Assignment,
    container: langium.CstNode
  ) {
    const itemRefProperty = this.getCrossReferenceProperty(feature);
    const getNodeRefText = (node: langium.AstNode) => {
      const resolvedNode: langium.AstNode = this.getNodeRef(node, itemRefProperty);
      return (
        resolvedNode && this.nameProvider.getQualifiedName(resolvedNode.$container, resolvedNode)
      );
    };
    const refText = getNodeRefText(cursorNode);
    const refProperty = assignment?.feature;
    const elements = (container?.element[refProperty] || []) as any[];
    const cacheMap = elements.reduce((result, node: unknown) => {
      const resolvedNode = this.getNodeRef(node, itemRefProperty);
      const name =
        resolvedNode && this.nameProvider.getQualifiedName(resolvedNode.$container, resolvedNode);
      if (name) {
        result[name] = true;
      }
      return result;
    }, {} as Record<string, true>);
    if (refText) {
      cacheMap[refText] = true;
    }
    return { elements, cacheMap, refText };
  }

  private getNodeRef(node: unknown, itemRefProperty?: string) {
    return itemRefProperty
      ? langium.isReference(node[itemRefProperty]) &&
          (node[itemRefProperty] as langium.Reference).ref
      : langium.isReference(node) && (node as langium.Reference).ref;
  }

  printDebug(commonSuperStack?: SuperMatch[]) {
    console.groupCollapsed("printDebug");
    const { cursorNode, triggerNode, cursorOffset, triggerOffset } = this.currentContext;
    // node = this.wrapAstNode(commonSuperRule, node, prevTokenOffset);
    console.log("cursorNode", cursorNode);
    console.log("triggerNode", triggerNode);
    console.log(
      "node.text",
      JSON.stringify(cursorNode.text),
      "triggerOffset",
      triggerOffset,
      "cursorOffset",
      cursorOffset
    );
    console.log(
      // this.isStringFeature(triggerNode.feature),
      "findRelevantNode",
      langium.findRelevantNode(cursorNode)
    );
    // console.log(
    //   "commonSuperStack",
    //   commonSuperStack.map((stack) => ({ ...stack, ...langium.findAllFeatures(stack.rule) }))
    // );
    if (commonSuperStack) {
      for (const o of commonSuperStack) {
        console.log(
          "type:",
          o.node.element.$type,
          "feature:",
          o.node.feature,
          "rule:",
          o.rule
          // langium.findAllFeatures(o.rule)
        );
      }
    }
    console.groupEnd();
  }
  protected completionWithFeatures(
    commonSuperStack: SuperMatch[],
    commonSuperRule: SuperMatch,
    config?: getCompletionInternalParam
  ) {
    if (commonSuperRule) {
      const { context, cursorNode, triggerNode, cursorOffset, triggerOffset } = this.currentContext;
      this.printDebug(commonSuperStack);
      const superNode = commonSuperStack[0];
      const containterNode = commonSuperStack[1] || commonSuperRule;
      console.log(
        "commonSuperRule",
        commonSuperRule
        // findLeafNodeAtOffset(commonSuperRule.node, cursorOffset)
      );
      console.groupCollapsed("input features");
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
        // const tokens = this.services.parser.LangiumParser._wrapper.input.filter(
        //   (o) => o.endOffset < triggerOffset
        // );
        console.log(
          "getCompletion",
          cursorOffset,
          cursorNode.text,
          flattened //.map((f) => f.feature.$type + ":" + f.text).join("|"),
          // possibleFeatures
          // tokens
          // this.services.parser.LangiumParser._wrapper.computeContentAssist("Document", tokens)
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
        console.log("nextFeatures", [...features]);
      }
      if (
        cursorNode.end === triggerOffset &&
        (!langium.isKeyword(cursorNode.feature) ||
          (cursorNode.text !== cursorNode.feature.value &&
            cursorNode.text !== context.triggerCharacter))
      ) {
        // console.log("push feature", node.feature);
        features.push(cursorNode.feature);
      }
      // const contextNode = this.getCompletetionContext(node);
      // console.log("contextNode", contextNode);
      console.groupEnd();
      this.trace("completionFor", () => {
        const includesFeature = [];
        const featureStream: langium.Stream<langium.AbstractElement | langium.CrossReference> =
          langium.stream(features).distinct((e) => (langium.isKeyword(e) ? e.value : e));
        for (const feature of featureStream) {
          includesFeature.push(feature);
          if (
            this.isIgnoreFeature(feature) ||
            (config?.filterFeature && !config.filterFeature(feature))
          ) {
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
          // const map = commonSuperStack.map((stack) =>
          //   this.mapApp(stack.rule, parseRule as langium.ParserRule)
          // );
          // const snip = map.filter(Boolean);
          console.log(
            "allowNode",
            feature,
            allowNode
            // snip,
            // snip.map((stacks) => this.to(stacks)),
            // commonSuperStack.map((stack) => Array.from(searchAllFeatures(stack.node.feature)))
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
                const isReferenceTrigger = langium.isCrossReference(cursorNode.feature);
                const isCursorTriggerNode =
                  triggerOffset <= cursorNode.end && triggerOffset > cursorNode.offset;
                if (isReferenceTrigger && isCursorTriggerNode && cursorNode.feature !== parseRule)
                  continue;
                const isCursorReference: boolean =
                  isReferenceTrigger && isCursorTriggerNode && cursorNode.feature === parseRule;
                const refId = this.getCrossReferenceProperty(parseRule) as string;
                const refNode = isCursorReference ? cursorNode : keywordFeatureNode;
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
                    const resolvedNode =
                      langium.isReference(node[refId]) && (node[refId] as langium.Reference).ref;
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
                    nodeList,
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
                      // console.log(node, info);
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
                if (langium.isKeyword(feature)) {
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
        console.log("features", includesFeature);
      });
    } else {
      // The entry rule is the first parser rule
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      // this.completionForRule(undefined, void 0, this.currentContext.acceptor);
    }
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
        return assignment.terminal.rule.ref.type === ast.List;
      }
    }
    return isArrayAssignment;
  }

  findArrayAssignment(
    cstNode: langium.CstNode,
    until: langium.CstNode = langium.isCrossReference(cstNode.feature)
      ? cstNode.element.$container.$cstNode
      : cstNode.element.$cstNode
  ): { assignment: langium.Assignment; container: langium.CstNode } | undefined {
    let n: langium.CstNode | undefined = cstNode;
    do {
      const assignment = _utils.getContainerOfTypeUntil(n.feature, langium.isAssignment, (node) =>
        langium.isParserRule(node)
      );
      if (assignment && this.isArrayAssignmentFeature(assignment)) {
        return { assignment, container: n.parent };
      }
      if (n === until || !this.nameProvider.namedReferenceFeatures[assignment?.feature]) {
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
      return langium.isTerminalRule(rule) || rule.name === ast.Block;
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
    const features = [] as SuperMatch[];
    let prev: langium.CstNode;
    for (node of _utils.searchContainerOfCstNode(node)) {
      if (node.element && this.isContainerExpression(node.element)) {
        if (this.ruleInterpreter.isRootRuleCallFeature(node)) {
          const feature = node.feature;
          const rule = <langium.ParserRule>feature.rule.ref;
          features.push({ rule, node, feature });
        }
        prev = node;
      } else if (prev) {
        break;
      }
    }
    return features;
  }

  isTopExpression = (item: unknown): item is langium.AstNode => {
    return this.isContainerExpression(item) && !this.isContainerExpression(item.$container);
  };

  isContainerExpression = (astNode: unknown): astNode is langium.AstNode => {
    return (
      !ast.isBlock(astNode) &&
      !ast.isDocumentContents(astNode) &&
      !ast.isDocument(astNode) &&
      !ast.isStoryBlock(astNode)
    );
  };


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
    const [, type, name] =
      (langium.isParserRule(keyword.$container) && /(.+?)_(.+)/.exec(keyword.$container.name)) ||
      [];
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

  getCrossReferenceProperty(crossRef: langium.CrossReference): string | undefined {
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
    info: Partial<CompletionItemType>;
  }> {
    const refId = _utils.findPropertyId(crossRef);
    if (refId) {
      const scope = this.scopeProvider.getScope(context, refId);
      const generated = [...scope.getAllElements()];
      // console.groupCollapsed("completionForCrossReference", crossRef, refId, context, generated);
      const duplicateStore = new Set<string>();
      for (const node of generated) {
        if (!duplicateStore.has(node.name)) {
          if (this.services.references.References.isNestedDeclaration(node, context)) {
            yield {
              node,
              info: {
                kind: _lsp.CompletionItemKind.Reference,
                detail: node.type,
                sortText: "0",
                commitCharacters: ["="],
                insertTextFormat: _lsp.InsertTextFormat.PlainText,
              },
            };
          }
          duplicateStore.add(node.name);
        }
      }
      // console.groupEnd();
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
          if (!langium.isLinkingError(parentRef)) {
            for (const node of scope.filterElementWith(
              (p) => p.name.indexOf(parentRef.name) > -1
            )) {
              if (!duplicateStore.has(node.name)) {
                acceptor(node, {
                  kind: _lsp.CompletionItemKind.Reference,
                  detail: node.type,
                  sortText: "0",
                  commitCharacters: ["="],
                  insertTextFormat: _lsp.InsertTextFormat.PlainText,
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
            insertTextFormat: _lsp.InsertTextFormat.PlainText,
          });
          duplicateStore.add(node.name);
        }
      }
      console.groupEnd();
    }
  }

  async resolveCompletionItem(document: langium.LangiumDocument, item: CompletionItemType) {
    const inputOffset = document.textDocument.offsetAt(
      (item.data as LspTypes.CompletionParams).position
    );
    return this.currentContext.resolveCompletionItem(item, inputOffset);
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
  // "",
  "%",
  "$",
];

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

export * from "./CompletionProviderContext";

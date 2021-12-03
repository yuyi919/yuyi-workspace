import {
  AbstractElement,
  AstNode,
  AstNodeDescription,
  CompletionAcceptor,
  DefaultCompletionProvider,
  findFirstFeatures,
  findNextFeatures,
  findNodeForFeature,
  findRelevantNode,
  getContainerOfType,
  isAstNode,
  isKeyword,
  isParserRule,
  isRuleCall,
  isTerminalRule,
  isTerminalRuleCall,
  LangiumDocument,
  MaybePromise,
  stream,
  TerminalRule,
} from "langium";
import * as Lsp from "vscode-languageserver-protocol";
import { CompletionList, CompletionTriggerKind } from "vscode-languageserver-protocol";
import * as Refenences from "../references";
import { AdvscriptServices } from "..";
import * as _utils from "../_utils";
import * as ast from "../ast";
import { createLogger } from "@yuyi919/shared-logger";

function getTrack(stack = 1, currentId: number) {
  try {
    throw Error();
  } catch (error) {
    const result: string = error.stack?.split(" at ")?.[stack]?.trim() || "";
    const [, url, row, col] =
      /^(.+):([0-9]+):([0-9]+)$/.exec(result.replace(/\)(.*)$/, "").replace(/^(.*?)\(/, "")) || [];
    const hasSource = url.endsWith(".js");
    return Object.assign(
      // hasSource
      //   ? sourcemapCatch(logger, url + ".map", parseInt(row), parseInt(col)).then((data) => {
      //       if (logger.historyList[currentId] && data && data.source) {
      //         Object.assign(logger.historyList[currentId], data);
      //         return data.source + ":" + data.line + ":" + data.column; // .replace(/\/\/\/(.+)loader\/(.+)\?!/, "///")
      //       }
      //       return result;
      //     })
      //   :
      {},
      {
        result,
        hasSource,
      }
    );
  }
}
export class CompletionProvider extends DefaultCompletionProvider {
  declare scopeProvider: Refenences.ScopeProvider;
  declare nameProvider: Refenences.NameProvider;
  logger = {
    log(message: any, ...args: any) {
      message &&
        console.info(
          `%c[CompletionProvider]%c`,
          "color: #00bbee; font-weight: bold;",
          "",
          message,
          ...args
        );
    },
    debug(message: any, ...args: any) {
      message &&
        console.debug(
          `%c[CompletionProvider]%c`,
          "color: #00bbee; font-weight: bold;",
          "",
          message,
          ...args
        );
    },
  };
  constructor(protected readonly services: AdvscriptServices) {
    super(services);
    this.scopeProvider = services.references.ScopeProvider;
    this.nameProvider = services.references.NameProvider;
  }

  options: Lsp.CompletionOptions = {
    triggerCharacters: ["=", ":", "@", ".", " ", "\n", "]", ")", "|", "[", "{", "(", ""],
  };

  protected fillCompletionItem(
    document: Lsp.TextDocument,
    offset: number,
    value: string | AstNode | AstNodeDescription,
    info: Partial<Lsp.CompletionItem> | undefined
  ): Lsp.CompletionItem | undefined {
    let label: string;
    if (typeof value === "string") {
      label = value;
    } else if (isAstNode(value) && this.nameProvider.isNamed(value)) {
      label = this.nameProvider.getName(value);
    } else if (!isAstNode(value)) {
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
    const item: Lsp.CompletionItem = {
      label: (prefix?.replace(/\(((?!\)).)*?\)$/, "") ?? "") + inputName,
      textEdit,
    };
    if (info) {
      Object.assign(item, info);
    }
    return item;
  }
  getCompletionSlot() {}
  getCompletion(
    document: LangiumDocument,
    params: Lsp.CompletionParams
  ): MaybePromise<Lsp.CompletionList> {
    return this._getCompletion(params, document);
  }
  getOneCompletion(
    document: LangiumDocument,
    params: Lsp.CompletionParams
  ): MaybePromise<Lsp.CompletionList> {
    return this._getCompletion(params, document);
  }

  private _getCompletion(params: Lsp.CompletionParams, document: LangiumDocument<AstNode>) {
    this.logger.log(
      "params",
      params.position,
      Object.entries(CompletionTriggerKind).find((o) => o[1] === params.context.triggerKind)?.[0],
      JSON.stringify(params.context.triggerCharacter)
    );
    const root = document.parseResult.value;
    const cst = root.$cstNode;
    const items: Lsp.CompletionItem[] = [];
    const inputOffset = document.textDocument.offsetAt(params.position);
    const tokens = this.services.parser.LangiumParser._wrapper.input.filter((token) => {
      return token.endOffset < inputOffset;
    });
    const acceptor = (
      value: string | AstNode | AstNodeDescription,
      item?: Partial<Lsp.CompletionItem>
    ) => {
      const completionItem = this.fillCompletionItem(
        document.textDocument,
        inputOffset,
        value,
        item
      );
      if (completionItem) {
        // this.logger.log(completionItem, value, item);
        items.push(completionItem);
      }
    };
    if (cst) {
      const prevTokenOffset = inputOffset - 1;
      let node = _utils.findWordNodeAtOffset(cst, prevTokenOffset);
      this.logger.log("node", node, prevTokenOffset);
      const commonSuperRule = node && this.findCommonSuperRule(node);
      if (commonSuperRule) {
        this.logger.log("commonSuperRule", commonSuperRule);
        if (
          commonSuperRule &&
          (ast.isAtInline(commonSuperRule.node.element) ||
            ast.isMacroPipe(commonSuperRule.node.element) ||
            ast.isCallMacro(commonSuperRule.node.element))
        ) {
          if (!commonSuperRule.node.element.ref?.ref) {
            node = _utils.findPrevTokenNode(commonSuperRule.node, prevTokenOffset);
            this.logger.log("node => prev", node);
          }
        }
        const nextNode = _utils.findNextTokenNode(commonSuperRule.node, prevTokenOffset);
        this.logger.log("nextNode", nextNode);
        const featureStack = this.buildFeatureStack(node);
        this.logger.log("featureStack", featureStack);
        const features = findNextFeatures(featureStack);
        this.logger.log("input features", [...features]);
        // In some cases, it is possible that we do not have a super rule
        if (commonSuperRule) {
          const flattened = Array.from(_utils.flattenCstGen(commonSuperRule.node)).filter(
            (e) => e.offset < inputOffset
          );
          const possibleFeatures = this.ruleInterpreter.interpretRule(
            commonSuperRule.rule,
            [...flattened],
            prevTokenOffset
          );
          this.logger.log(
            "getCompletion",
            prevTokenOffset,
            node.text,
            flattened, //.map((f) => f.feature.$type + ":" + f.text).join("|"),
            possibleFeatures
            // tokens
            // this.services.parser.LangiumParser._wrapper.computeContentAssist("Document", tokens)
          );
          // Remove features which we already identified during parsing
          const partialMatches = possibleFeatures.filter((e) => {
            const match = this.ruleInterpreter.featureMatches(
              e,
              flattened[flattened.length - 1],
              prevTokenOffset
            );
            console.log(e, match);
            return match === "partial" || match === "both";
          });
          const notMatchingFeatures = possibleFeatures.filter((e) => !partialMatches.includes(e));
          // this.logger.log("partialMatches", partialMatches, [...features]);
          features.push(...partialMatches);
          const nextFeatures = notMatchingFeatures.flatMap((e) => findNextFeatures([e]));
          // this.logger.log("notMatchingFeatures => nextFeatures", nextFeatures, [...features]);
          features.push(...nextFeatures);
        }
        if (node.end > inputOffset) {
          // this.logger.log("push feature", node.feature);
          features.push(node.feature);
        }
        const includesFeature = [];
        for (const feature of stream(features).distinct((e) => (isKeyword(e) ? e.value : e))) {
          if (isKeyword(feature) && isParserRule(feature.$container)) {
            const featureName = feature.$container.name;
            // findAllFeatures;
            const keywordFeatureNode = _utils.findNodeWithFeature(
              commonSuperRule.node,
              featureName
            );
            // _utils.findNodeForFeature(commonSuperRule.node, feature.$container.name);
            console.log(
              "findNodeForFeature",
              feature,
              keywordFeatureNode,
              this.buildFeatureStack(commonSuperRule.node),
              findNextFeatures([commonSuperRule.node.feature])
            );
            if (keywordFeatureNode) {
              if (!isNaN(keywordFeatureNode.offset)) {
                console.log("skip exsist feature", feature);
                continue;
              }
              this.completionFor(findRelevantNode(node), feature, acceptor);
              includesFeature.push(feature);
            }
            // if (/_R$/.test(feature.$container.name)) {
            //   this.completionFor(findRelevantNode(node), feature, acceptor);
            //   includesFeature.push(feature);
            // } else
            else {
              console.log("not find feature", feature, "in", commonSuperRule.node);
            }
            continue;
          }
          this.completionFor(findRelevantNode(node), feature, acceptor);
          includesFeature.push(feature);
        }
        this.logger.log("features", includesFeature);
      } else {
        // The entry rule is the first parser rule
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const parserRule = this.grammar.rules.find((e) => isParserRule(e))!;
        this.completionForRule(undefined, parserRule, acceptor);
      }
    }
    return CompletionList.create(
      items.map((o) => ({
        ...o,
        insertTextFormat: 1,
      })),
      true
    );
  }
  protected completionFor(
    astNode: AstNode | undefined,
    feature: AbstractElement,
    acceptor: CompletionAcceptor
  ): void {
    console.log("completionFor", feature);
    if (isRuleCall(feature) && isTerminalRule(feature.rule.ref)) {
      this.completionForTerminalRule(astNode, feature.rule.ref, acceptor);
    } else {
      super.completionFor(astNode, feature, acceptor);
    }
  }

  protected completionForTerminalRule(
    astNode: AstNode | undefined,
    feature: TerminalRule,
    acceptor: CompletionAcceptor
  ): void {
    console.log(
      "completionForTerminalRule",
      feature,
      this.services.parser.LangiumParser._lexer.lexerDefinitionErrors
    );
  }
}

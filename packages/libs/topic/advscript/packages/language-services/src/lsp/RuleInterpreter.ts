/* eslint-disable @typescript-eslint/no-this-alias */
import langium, { isTerminalRule, isAbstractElement, isCrossReference, isRuleCall } from "langium";
import { RuleInterpreter as DefaultRuleInterpreter } from "langium/lib/lsp";
import { AdvScriptServices } from "../advscript-module";
import * as ast from "../ast-utils";
import { SuffixAutomaton } from "../libs/trie/SuffixAutomaton";
import type * as References from "../references";
import {
  FeatureCrossReference,
  FeatureKeywordTypedValue,
  FeatureYieldValue,
} from "./follow-element-computation";
import { searchAllAlternatives } from "./searchAllAlternatives";
import { isSnippetPlaceholderItem, isSnippetReferenceItem, SnippetHelper } from "./SnippetString";
import {
  FeatureData,
  filterRuleTreeEnums,
  generateRuleTreeEnum,
  ruleFeatures2Element,
  RuleTreeEnumYieldValue,
  toSnippet,
  WrapContext,
} from "./wrapAllAlternatives";

type Config = Pick<langium.Assignment, "cardinality" | "operator">;
type CacheConfig<T> = {
  names: string[];
  nameMap: Record<string, T>;
};

type RuleDataType = "string" | "number" | "boolean" | "none" | (string & {});

export class RuleInterpreter extends DefaultRuleInterpreter {
  declare scopeProvider: References.ScopeProvider;
  declare nameProvider: References.NameProvider;
  declare reflection: langium.AstReflection & ast.AdvScriptAstReflection;

  rules: Record<string, langium.AbstractRule>;
  ruleAlternatives: Record<
    string,
    RuleTreeEnumYieldValue<FeatureData<FeatureKeywordTypedValue>[]>[]
  >;
  ruleFeatureMap: Record<string, WeakMap<langium.AbstractElement, Config>>;
  leafFeatureMap: WeakMap<langium.AbstractElement, CacheConfig<Config>>;
  leafParentMap: Record<string, CacheConfig<true>>;
  leafsMap: Record<string, CacheConfig<langium.AbstractElement[]>>;
  dataTypeMap = {} as Record<RuleDataType, Record<string, true>>;

  tokenRules: Record<string, Record<string, true>> = {};

  constructor(protected readonly services: AdvScriptServices) {
    super();
    this.scopeProvider = services.references.ScopeProvider;
    this.nameProvider = services.references.NameProvider;
    this.reflection = services.shared.AstReflection;

    this.ruleFeatureMap = {};
    this.leafFeatureMap = new WeakMap();
    this.leafParentMap = {};
    this.leafsMap = {};
    this.rules = services.Grammar.rules.reduce((r, rule) => ((r[rule.name] = rule), r), {});
    this.ruleAlternatives = services.Grammar.rules.reduce((r, rule) => {
      const ruleName = rule.name;
      const map = this.ruleFeatureMap[ruleName] || (this.ruleFeatureMap[ruleName] = new WeakMap());
      const leafsMap =
        this.leafsMap[ruleName] || (this.leafsMap[ruleName] = { names: [], nameMap: {} });
      const arr = [] as RuleTreeEnumYieldValue<FeatureData<FeatureKeywordTypedValue>[]>[];
      for (const datas of generateRuleTreeEnum(rule)) {
        for (const data of datas) {
          if (isAbstractElement(data.feature) && data.assignment) {
            const config = {
              cardinality: data.feature.cardinality,
              operator: data.assignment?.operator,
            };
            if (isRuleCall(data.feature) || isCrossReference(data.feature)) {
              const leafName = data.name;
              let leafMap = this.leafFeatureMap.get(data.feature);
              // console.log(leafMap);
              if (!leafMap) {
                leafMap = {
                  names: [],
                  nameMap: {},
                };
                this.leafFeatureMap.set(data.feature, leafMap);
              }
              if (!leafMap.nameMap[ruleName]) {
                leafMap.nameMap[ruleName] = config;
                leafMap.names.push(ruleName);
              }

              if (!leafsMap.nameMap[leafName]) {
                leafsMap.nameMap[leafName] = [];
                leafsMap.names.push(leafName);
              }
              leafsMap.nameMap[leafName].push(data.feature);

              const leafParentMap =
                this.leafParentMap[leafName] ||
                (this.leafParentMap[leafName] = { names: [], nameMap: {} });
              if (!leafParentMap.nameMap[ruleName]) {
                leafParentMap.nameMap[ruleName] = true;
                leafParentMap.names.push(ruleName);
              }
            }
            map.set(data.feature, config);
          }
          const keyword = datas.filter((o) => o.kind !== "Action");
          if (
            keyword.length === 1 &&
            (keyword[0].kind === "RuleCall" || keyword[0].kind === "Keyword") &&
            (!keyword[0].feature.cardinality || keyword[0].feature.cardinality === "?")
          ) {
            const name = keyword[0].name;
            const map = this.tokenRules[name] || (this.tokenRules[name] = {});
            map[ruleName] = true;
          }
        }
        const dataType = this.getRuleType(rule, datas);
        this.dataTypeMap[dataType] = {
          ...this.dataTypeMap[dataType],
          [ruleName]: true,
        };
        arr.push(datas);
      }
      return (r[ruleName] = arr), r;
    }, {});

    SuffixAutomaton.buildWithGenerator(this.build());
  }

  *build() {
    let group = 0;
    for (const key in this.ruleAlternatives) {
      if (
        !this.rules[key].fragment &&
        !isTerminalRule(this.rules[key]) &&
        !(this.rules[key] as langium.ParserRule).entry
        && !ast.isExpressionNodeKind(key)
      ) {
        const rule = this.ruleAlternatives[key];
        let ruleIndex = 0;
        for (const data of rule) {
          if (data.length > 1) {
            ruleIndex++;
            // console.log(key);
            let id = 0;
            for (const config of data) {
              yield { id: id++, group: key + "|" + ruleIndex, char: config.name };
            }
            group++;
          }
        }
      }
    }
  }

  getRuleType(
    rule: langium.AbstractRule,
    features: RuleTreeEnumYieldValue<FeatureData<FeatureKeywordTypedValue>[]>
  ): RuleDataType {
    if (this.isConstDataTypeRule(rule)) return rule.type || "none";
    return features.nameStack?.length > 0 ? features.nameStack.join(":") : rule.name;
  }

  checkRuleDataType(ruleName: string, dataType: RuleDataType): boolean {
    return this.dataTypeMap[dataType]?.[ruleName] || false;
  }

  isConstDataTypeRule(ruleName: langium.AbstractRule | string): boolean {
    const rule = typeof ruleName === "string" ? this.rules[ruleName] : ruleName;
    return (
      (rule && typeof rule.type === "string" && (!this.rules[rule.type] || isTerminalRule(rule))) ||
      false
    );
  }

  isRootRuleCallFeature(
    node: langium.CstNode
  ): node is langium.CstNode & { feature: langium.RuleCall } {
    const feature = this.getRuleCallFeature(node);
    if (feature) {
      const rule = feature.rule.ref as langium.ParserRule;
      const isConst = this.isConstDataTypeRule(rule);
      if (!isConst) {
        return true;
      }
    }
    return false;
  }

  getRuleCallFeature(node: langium.CstNode): langium.RuleCall | undefined {
    if (isRuleCall(node.feature) && node.feature.rule.ref) {
      return node.feature as langium.RuleCall;
    }
  }

  getParserRuleWithRuleCall(feature: langium.RuleCall): langium.ParserRule | undefined {
    return feature && feature.rule.ref as langium.ParserRule;
  }

  // getFeatureName(source: string) {
  //   let name: string;
  //   while ((name = name ? this.tokenRules[name] : source)) return source;
  // }
  interpretWithFeatures(
    nextFeatures: FeatureData[],
    [...nodes]: langium.CstNode[],
    offset: number
  ): FeatureData[] {
    let features: FeatureData[] = [];
    let node;
    while ((node = nodes.shift())) {
      const n = node;
      features = [];
      for (const e of nextFeatures) {
        const match = this.featureMatches(e.feature as any, n, offset);
        if (match === "full" || match === "both") {
          features.push(e);
        }
      }
    }
    return features;
  }

  wrapAllAlternatives = (rule: langium.AbstractRule, context?: WrapContext) => {
    context = {
      ...context,
      root: context?.root || rule,
    };
    const snippets = [] as {
      value: string;
      label: string;
      preview: string;
      prefixText?: string;
    }[];
    const references = [] as FeatureData<FeatureCrossReference>[];
    const snipValues = {};
    const $snippet = new SnippetHelper();
    console.groupCollapsed("wrapAllAlternativesWithCache");
    // const generatorOrCaches = generateRuleTreeEnum(
    //   rule as langium.ParserRule,
    //   context.root,
    //   context.prevRule && toConstMap([context.prevRule.rule.$refText])
    // );
    const generatorOrCaches = filterRuleTreeEnums(rule as langium.ParserRule, context);
    console.groupEnd();
    // const crossReferenceCache = new WeakMap<SnippetItem, false | string[]>();
    const refNameCache = {};
    for (const elements of generatorOrCaches) {
      const ruleTreeEnumYieldValue = ruleFeatures2Element(elements, context);
      // console.log(
      //   "wrapAllAlternatives",
      //   ...(ruleTreeEnumYieldValue.length > 2 ? [ruleTreeEnumYieldValue] : ruleTreeEnumYieldValue)
      // );
      // $snippet.appendVariable(SnippetVariables.BLOCK_COMMENT_START);
      // $snippet.appendVariable(SnippetVariables.BLOCK_COMMENT_END);
      const label = ruleTreeEnumYieldValue.nameStack?.join(":");
      if (ruleTreeEnumYieldValue.length === 1) {
        const [data] = ruleTreeEnumYieldValue;
        if (isSnippetReferenceItem(data)) {
          if (!refNameCache[data.data.name]) {
            refNameCache[data.data.name] = true;
            references.push(data.data);
          }
          continue;
        }
        // if (isTriggeredKeyword(data, context)) {
        //   continue;
        // } else
        else if (
          context.prevRule &&
          isSnippetPlaceholderItem(data) &&
          data.data &&
          data.data.feature === context.prevRule
        ) {
          continue;
        }
      }
      toSnippet(ruleTreeEnumYieldValue, $snippet);
      // let enumed = false;
      if (!snipValues[$snippet.value]) {
        snippets.push({ ...$snippet.next(), label });
      } else {
        snipValues[$snippet.value] = true;
      }
    }
    return { snippets, references };
  };
}

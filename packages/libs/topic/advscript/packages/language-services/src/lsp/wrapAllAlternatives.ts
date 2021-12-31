import { isDataTypeRule } from "langium";
import * as langium from "langium/lib/grammar/generated/ast";
import * as ast from "../ast-utils";
import { FeatureKeywordTypedValue } from "./follow-element-computation";
import * as SnippetString from "./SnippetString";
import { FILTER } from "./searchAllAlternatives";
import { toConstMap } from "../_utils";
import { generateTreeEnum } from "./generateTreeEnum";

export type FeatureData = FeatureKeywordTypedValue & {
  name: string;
  assignment: langium.Assignment;
};
export type WrapContext = {
  root?: langium.ParserRule;
  filter?: FILTER;
  crossrefs?: Record<string, WrapCrossref[]>;
};
export type WrapCrossref = any;
export function wrapAllAlternatives(rule: langium.ParserRule, filter?: FILTER) {
  const snips = [] as SnippetString.SnippetString[];
  console.groupCollapsed("all");
  const all = [...wrapAllAlternativesWithCache(rule, { root: rule, filter })];
  console.groupEnd();
  for (const r of all) {
    const snip = new SnippetString.SnippetString();
    snips.push(snip);
    console.log("wrapAllAlternatives", ...(r.length > 2 ? [r] : r));
    for (const item of r) {
      if (typeof item === "string") {
        snip.appendText(item);
      } else if ("kind" in (item as SnippetString.SnippetItem)) {
        const snimpetItem = item as SnippetString.SnippetItem;
        switch (snimpetItem.kind) {
          case SnippetString.SnippetStringItemKind.Text:
            snip.appendText(snimpetItem.value);
            break;
          case SnippetString.SnippetStringItemKind.Placeholder:
            snip.appendPlaceholder(snimpetItem.name);
            break;
          case SnippetString.SnippetStringItemKind.Variable:
            snip.appendVariable(snimpetItem.type, snimpetItem.defaultValue);
            break;
          case SnippetString.SnippetStringItemKind.Choice:
            snip.appendChoice(snimpetItem.values);
            break;
        }
      } else if (SnippetString.SnippetString.isSnippetString(item)) {
        snips.push(item);
      }
    }
  }
  return snips;
}
function wrapDataTypeRule(rule: langium.ParserRule, context: WrapContext) {
  if (isDataTypeRule(rule) && ["string", "number", "boolean"].includes(rule.type)) {
    // if (rule.name === "LabelContent")
    //   return {
    //     kind: SnippetString.SnippetStringItemKind.Placeholder,
    //     name: "LabelContent",
    //   } as SnippetString.SnippetItem;
    const data = Array.from(generateRuleTreeEnum(rule, context.root));
    const values = data.flatMap(
      (elements) => Array.from(wrapFeatureKeywordValue(elements, context)) as string[]
    );
    if (values.every((e) => typeof e === "string")) {
      if (data.length > 1 && rule.alternatives.$type === langium.Alternatives) {
        const item = {
          kind: SnippetString.SnippetStringItemKind.Choice,
          values: values,
        } as SnippetString.SnippetItem;
        console.log("wrapDataTypeRule", rule, item);
        return item;
      } else {
        return rule.name + values.join("");
      }
    }
  }
}
const AllMap = new WeakMap<langium.AbstractRule, (string | SnippetString.SnippetItem)[][]>();
globalThis.wrapAllAlternativesTemp = AllMap;
function* _wrapAllAlternatives(
  rule: langium.AbstractRule,
  context: WrapContext
): Generator<(string | SnippetString.SnippetItem)[]> {
  if (langium.isParserRule(rule)) {
    const item = wrapDataTypeRule(rule, context);
    if (item) {
      yield [item];
      return;
    }
  }
  // console.groupCollapsed("_wrapAllAlternatives", rule);
  for (const elements of [...generateRuleTreeEnum(rule as langium.ParserRule, context.root)]) {
    // console.log("_wrapAllAlternatives", elements);
    yield Array.from(wrapFeatureKeywordValue(elements, context)).flat(8);
  }
  // console.groupEnd()
}
function wrapAllAlternativesWithCache(
  rule: langium.AbstractRule,
  context: WrapContext
): Generator<(string | SnippetString.SnippetItem)[]> | (string | SnippetString.SnippetItem)[][] {
  if (AllMap.has(rule)) {
    return AllMap.get(rule);
  }
  return (function* temp() {
    const stack = [] as (string | SnippetString.SnippetItem)[][];
    for (const r of _wrapAllAlternatives(rule, context)) {
      stack.push(r);
      yield r;
    }
    AllMap.set(rule, stack);
  })();
  // console.groupEnd()
}
function* wrapFeatureKeywordValue(
  element: FeatureData | any[],
  context: WrapContext,
  index?: number,
  list?: (FeatureData | FeatureData[])[]
): Generator<string | (string | SnippetString.SnippetItem)[]> {
  if (element instanceof Array) {
    for (let index = 0; index < element.length; index++) {
      const e = element[index];
      yield* wrapFeatureKeywordValue(e, context, index, element);
    }
  } else if (element.kind === langium.Keyword) {
    yield element.feature.value;
  } else if (element.kind === langium.TerminalRule) {
    switch (element.feature.name) {
      case ast.WS:
        yield " ";
        break;
      case ast.Indent:
        yield "";
        break;
      case ast.NUMBER:
        yield [
          {
            kind: SnippetString.SnippetStringItemKind.Placeholder,
            name: "0",
          } as SnippetString.SnippetPlaceholderItem,
        ];
        break;
      case ast.EOL: {
        yield "\r\n";
        break;
      }
      case ast.STRING:
        yield [
          '"',
          {
            kind: SnippetString.SnippetStringItemKind.Placeholder,
            name: "STRING",
          } as SnippetString.SnippetPlaceholderItem,
          '"',
        ];
        break;
      default:
        yield [
          {
            kind: SnippetString.SnippetStringItemKind.Placeholder,
            name: element.feature.name,
          } as SnippetString.SnippetPlaceholderItem,
        ];
        break;
    }
  } else if (element.kind === langium.RuleCall) {
    if (
      !langium.isParserRule(element.feature.rule.ref) ||
      isDataTypeRule(element.feature.rule.ref)
    ) {
      // console.log("wrap isDataTypeRule", element.feature.rule.ref);
      for (const o of wrapAllAlternativesWithCache(element.feature.rule.ref, context)) {
        yield o;
      }
      return;
    }
    yield [
      {
        kind: SnippetString.SnippetStringItemKind.Placeholder,
        name: `/* ${element.feature.rule.$refText} */`,
      } as SnippetString.SnippetPlaceholderItem,
    ];
    // yield element;
    return;
  } else if (element.kind === langium.CrossReference) {
    yield [
      {
        kind: SnippetString.SnippetStringItemKind.Placeholder,
        name: element.feature.type.$refText,
      } as SnippetString.SnippetPlaceholderItem,
    ];
    return;
  }
  // yield element;
  return;
}

globalThis.isDataTypeRule = isDataTypeRule;
globalThis.generateTreeEnum = generateTreeEnum;
export function* generateRuleTreeEnum(rule: langium.ParserRule, rootRule?: langium.ParserRule) {
  const result = [];
  const IgnoreMap = {
    [ast.Content]: toConstMap([ast.WS, ast.EOL, ast.ESCToken, ast.CommonIndent]),
    [ast.Dialog]: toConstMap([ast.WS, "Token_Comma", ast.EOL, ast.ESCToken, ast.CommonIndent]),
  };
  //
  function isIgnoreItem(item: langium.AbstractRule | langium.AbstractElement | string): boolean {
    return (
      item &&
      (IgnoreMap[rootRule.name] || IgnoreMap[rootRule.name])?.[
        typeof item === "string" ? item : (item as langium.AbstractRule).name
      ]
    );
  }
  const childrenSet = new WeakSet();
  for (const element of generateTreeEnum<
    langium.AbstractElement | langium.ParserRule | langium.TerminalRule
  >([rule], (item) => {
    if (isIgnoreItem(item)) {
      return false;
    }
    let children: (langium.ParserRule | langium.AbstractElement | langium.TerminalRule)[][];
    if (langium.isParserRule(item)) {
      return [[item.alternatives]];
    } else if (langium.isTerminalRule(item)) {
      return;
    } else if (langium.isAlternatives(item)) {
      children = item.elements.map((o) => [o]);
    } else if (langium.isGroup(item)) {
      children = [item.elements];
    } else if (langium.isAssignment(item) && !childrenSet.has(item)) {
      const next = { ...item };
      childrenSet.add(next);
      if (isIgnoreItem((item.terminal as langium.RuleCall).rule?.$refText)) {
        return false;
      }
      children = [[next, item.terminal]];
      if (langium.isRuleCall(item.terminal) && ast.isRequiredRuleCall(item.terminal)) {
        return children;
      }
    } else if (langium.isRuleCall(item)) {
      if (isIgnoreItem(item.rule.$refText)) {
        return false;
      }
      if (ast.isResolvableRuleCall(item)) {
        children = [[item.rule.ref as langium.ParserRule | langium.TerminalRule].filter(Boolean)];
      }
      // return children;
    }
    if (ast.isOptionalFeature(item)) {
      if (children) {
        if (!children[0]?.length) return [false];
        return [false, ...children];
      } else {
        if (!childrenSet.has(item)) {
          const resolve = { ...item };
          childrenSet.add(resolve);
          return [false, [resolve]];
        }
        // return [[], [{ ...item, cardinality: null }]];
      }
    }
    return children;
  })) {
    const resolve = element
      .filter((e) => !isIgnoreItem((e as langium.RuleCall).rule?.$refText))
      .map(
        (item) =>
          ({
            feature: item,
            kind: item.$type,
            name:
              (item as langium.AbstractRule).name ||
              (item as langium.RuleCall).rule?.$refText ||
              item.$type,
          } as FeatureData)
      );
    if (resolve.length > 0) {
      yield resolve;
      result.push(resolve);
    }
  }
  console.log("generateRuleTreeEnum", rule, result);
}
globalThis.generateRuleTreeEnum = generateRuleTreeEnum;

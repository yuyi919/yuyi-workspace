/* eslint-disable no-inner-declarations */
import { CstNode, isDataTypeRule, getContainerOfType, LeafCstNode, CrossReference } from "langium";
import * as langium from "langium/lib/grammar/generated/ast";
import * as ast from "../ast-utils";
import { isEqual } from "lodash";
import { FeatureKeywordTypedValue, FeatureCrossReference } from "./follow-element-computation";
import {
  SnippetItem,
  SnippetReferenceItem,
  SnippetPlaceholderItem,
  SnippetHelper,
  SnippetStringItemKind,
  SnippetVariables,
  isSnippetReferenceItem,
  isSnippetPlaceholderItem
} from "./SnippetString";
import { FILTER } from "./searchAllAlternatives";
import * as _utils from "../_utils";
import { appendCache, CacheItem, generateTreeEnum } from "./generateTreeEnum";

export type FeatureData<T extends FeatureKeywordTypedValue = FeatureKeywordTypedValue> = T & {
  name: string;
  assignment?: langium.Assignment;
  feature: langium.AbstractElement;
  stack: langium.AbstractElement[];
  loop?: LoopFeature;
};
export interface WrapContext {
  root?: langium.AbstractRule;
  filter?: FILTER;
  crossrefs?:
    | Record<string, string[]>
    | ((type: string, feature: FeatureData<FeatureCrossReference>) => string[]);
  node?: CstNode;
  triggerNode?: CstNode;
  prevRule?: langium.RuleCall;
  containerNode?: CstNode;
}

// export function wrapAllAlternatives(rule: langium.AbstractRule, context?: WrapContext) {
//   context = {
//     ...context,
//     root: context?.root || rule,
//   };
//   const snippets = [] as {
//     value: string;
//     label: string;
//     preview: string;
//     prefixText?: string;
//   }[];
//   const references = [] as FeatureData<FeatureCrossReference>[];
//   const snipValues = {};
//   const $snippet = new SnippetHelper();
//   console.groupCollapsed("wrapAllAlternativesWithCache");
//   const generatorOrCaches = _wrapAllAlternatives(rule, context);
//   console.groupEnd();
//   // const crossReferenceCache = new WeakMap<SnippetItem, false | string[]>();
//   const refNameCache = {};
//   for (const ruleTreeEnumYieldValue of generatorOrCaches) {
//     // console.log(
//     //   "wrapAllAlternatives",
//     //   ...(ruleTreeEnumYieldValue.length > 2 ? [ruleTreeEnumYieldValue] : ruleTreeEnumYieldValue)
//     // );
//     // $snippet.appendVariable(SnippetVariables.BLOCK_COMMENT_START);
//     // $snippet.appendVariable(SnippetVariables.BLOCK_COMMENT_END);
//     const label = ruleTreeEnumYieldValue.nameStack?.join(":");
//     if (ruleTreeEnumYieldValue.length === 1) {
//       const [data] = ruleTreeEnumYieldValue;
//       if (isSnippetReferenceItem(data)) {
//         if (!refNameCache[data.data.name]) {
//           refNameCache[data.data.name] = true;
//           references.push(data.data);
//         }
//         continue;
//       } else if (isTriggeredKeyword(data, context)) {
//         continue;
//       } else if (
//         context.prevRule &&
//         isSnippetPlaceholderItem(data) &&
//         data.data &&
//         data.data.feature === context.prevRule
//       ) {
//         continue;
//       }
//     }
//     toSnippet(ruleTreeEnumYieldValue, $snippet);
//     // let enumed = false;
//     if (!snipValues[$snippet.value]) {
//       snippets.push({ ...$snippet.next(), label });
//     } else {
//       snipValues[$snippet.value] = true;
//     }
//   }
//   return { snippets, references };
// }

function isTriggeredKeyword(feature: string | SnippetItem, context: WrapContext) {
  return (
    typeof feature === "string" &&
    (feature === context.triggerNode?.text || feature === context.node?.text)
  );
}

function wrapDataTypeRule(rule: langium.ParserRule, context: WrapContext) {
  if (
    langium.isTerminalRule(rule) ||
    (isDataTypeRule(rule) && ["string", "number", "boolean"].includes(rule.dataType))
  ) {
    if (rule.name in RULE_PREVIEW) return RULE_PREVIEW[rule.name];
    const data = [...generateRuleTreeEnum(rule, context.root)];
    const values = data.map((elements) => [...wrapFeatureKeywordValue(elements, context)]);
    // console.log(rule.name, values);
    if (values.every((e) => e.every((e) => typeof e === "string"))) {
      if (data.length > 1 && rule.alternatives.$type === langium.Alternatives) {
        const item = {
          kind: SnippetStringItemKind.Choice,
          values: values.map((v) => v.join("")),
          name: rule.name
        } as SnippetItem;
        console.log("wrapDataTypeRule", rule, item);
        return item;
      } else {
        return values.flat(1).join("");
      }
    } else {
      return {
        kind: SnippetStringItemKind.Text,
        value: rule.name
      } as SnippetItem;
    }
  }
}

const AllMap = new WeakMap<langium.AbstractRule, (string | SnippetItem)[][]>();
globalThis.wrapAllAlternativesTemp = AllMap;
function* _wrapAllAlternatives(
  rule: langium.AbstractRule,
  context: WrapContext
): Generator<RuleTreeEnumYieldValue<(string | SnippetItem)[]>> {
  if (langium.isParserRule(rule)) {
    const item = wrapDataTypeRule(rule, context);
    if (item) {
      yield [item];
      return;
    }
  }
  // console.groupCollapsed("_wrapAllAlternatives", rule);
  for (const elements of filterRuleTreeEnums(rule as langium.ParserRule, context)) {
    yield ruleFeatures2Element(elements, context);
  }
  // console.groupEnd()
}

export function ruleFeatures2Element(
  elements: RuleTreeEnumYieldValue<FeatureData<FeatureKeywordTypedValue>[]>,
  context: WrapContext
) {
  const ruleTreeEnumYieldValue = extendRuleTreeEnumYieldValue(elements, (elements) =>
    Array.from(wrapFeatureKeywordValue(elements, context)).flat(8)
  );
  return ruleTreeEnumYieldValue;
}
export function toSnippet(
  ruleTreeEnumYieldValue: RuleTreeEnumYieldValue<(string | SnippetItem)[]>,
  $snippet = new SnippetHelper()
) {
  // console.log(
  //   "wrapAllAlternatives",
  //   ...(ruleTreeEnumYieldValue.length > 2 ? [ruleTreeEnumYieldValue] : ruleTreeEnumYieldValue)
  // );
  // $snippet.appendVariable(SnippetVariables.BLOCK_COMMENT_START);
  // $snippet.appendVariable(SnippetVariables.BLOCK_COMMENT_END);
  const label = ruleTreeEnumYieldValue.nameStack?.join(":");
  // let enumed = false;
  for (const item of ruleTreeEnumYieldValue) {
    if (typeof item === "string") {
      $snippet.appendText(item);
    } else if ("kind" in (item as SnippetItem)) {
      const snippetItem = item as SnippetItem;
      switch (snippetItem.kind) {
        case SnippetStringItemKind.Reference: {
          // let refs = crossReferenceCache.get(snippetItem);
          // if (!enumed && !refs) {
          //   refs =
          //     context &&
          //     (typeof context.crossrefs === "function"
          //       ? context.crossrefs(snippetItem.type, snippetItem.feature)
          //       : context.crossrefs?.[snippetItem.type]);
          //   crossReferenceCache.set(item, refs);
          // }
          // if (!enumed && refs) {
          //   $snippet.appendChoice(refs, void 0, snippetItem.type);
          //   enumed = true;
          // } else {
          $snippet.appendPlaceholder(snippetItem.type);
          // }
          break;
        }
        case SnippetStringItemKind.Text:
          $snippet.appendText(snippetItem.value);
          break;
        case SnippetStringItemKind.Placeholder:
          $snippet.appendPlaceholder(snippetItem.name);
          break;
        case SnippetStringItemKind.Variable:
          $snippet.appendVariable(snippetItem.type, snippetItem.defaultValue);
          break;
        case SnippetStringItemKind.Choice:
          $snippet.appendChoice(snippetItem.values, void 0, snippetItem.name);
          break;
      }
    } else if (SnippetHelper.isSnippetString(item)) {
      return item;
    }
  }
  return $snippet;
}

export function findStartEnd(
  elements: FeatureData<FeatureKeywordTypedValue>[],
  startNode: CstNode,
  prevRule: langium.RuleCall,
  triggerNode?: CstNode,
  containerNode?: CstNode
) {
  const isNewType = isSpaceInput(triggerNode);
  const prevRuleIndex = prevRule
    ? elements.findIndex(
        (feature) =>
          isFeatureSource(feature, prevRule) ||
          feature.feature === (prevRule.rule.ref as langium.ParserRule).alternatives
      )
    : -1;
  const newTypeIndex =
    !(prevRule && prevRuleIndex === -1) && isNewType
      ? elements.findIndex((feature) => isSpaceInputFeature(feature))
      : -1;
  const start = Math.max(
    newTypeIndex,
    elements.findIndex((feature) => isFeatureSource(feature, startNode.feature)),
    prevRuleIndex,
    triggerNode && (triggerNode as LeafCstNode).tokenType?.name === ast.WS ? 0 : -1
  );
  if (start > -1) {
    const endNode = findLastNonHiddenNode(containerNode || (startNode.element.$cstNode as any));
    if (endNode) {
      const endFeature = endNode.feature as langium.AbstractElement;
      const end = Math.max(
        elements.findIndex((feature) => isFeatureSource(feature, endFeature)),
        prevRuleIndex,
        newTypeIndex
      );
      return { start, end, startNode, endNode, isNewType };
    }
  }
}

function isSpaceInputFeature(feature: FeatureData<FeatureKeywordTypedValue>): unknown {
  return _utils.isWhiteSpaceFeature(feature.feature);
}

function isFeatureSource(
  feature: FeatureData<FeatureKeywordTypedValue>,
  prevRule: langium.AbstractElement
): unknown {
  return feature.feature === prevRule;
}

function isSpaceInput(triggerNode: CstNode) {
  return (
    triggerNode &&
    ((triggerNode.feature as langium.RuleCall)?.rule?.$refText === ast.Space ||
      (triggerNode as LeafCstNode).tokenType?.name === ast.WS)
  );
}

export function* generateSnippetEnumsWithRule(rule: langium.ParserRule, context: WrapContext) {
  for (const elements of generateRuleTreeEnum(
    rule as langium.ParserRule,
    context.root,
    context.prevRule && _utils.toConstMap([context.prevRule.rule.$refText])
  )) {
    yield toSnippet(ruleFeatures2Element(elements, context));
  }
}
export function getSnippetEnumsWithRule(rule: langium.ParserRule, context: WrapContext) {
  context = {
    ...context,
    root: context?.root || rule
  };
  return [...generateSnippetEnumsWithRule(rule, context)];
}
export function* filterRuleTreeEnums(
  rule: langium.ParserRule,
  context: WrapContext,
  debug = false
) {
  const crossrefs = new Set();
  for (const elements of filterRuleTree(rule, context)) {
    const startNode = context.node;
    const pos =
      context.node &&
      findStartEnd(
        elements,
        context.node,
        context.prevRule,
        context.triggerNode,
        context.containerNode
      );
    if (pos) {
      // eslint-disable-next-line prefer-const
      const { start, end, startNode, endNode, isNewType } = pos;
      const isRefTrigger =
        elements[start].kind !== langium.Keyword &&
        !ast.isKeywordRuleCall(elements[start].feature) &&
        !isNewType;
      let sliceStart = isRefTrigger ? start : start + 1;
      while (elements[sliceStart] && _utils.isWhiteSpaceFeature(elements[sliceStart].feature)) {
        sliceStart++;
      }
      const filtered =
        end > start
          ? elements.slice(sliceStart, end + 1)
          : context.triggerNode?.feature?.$type === langium.CrossReference
          ? elements.slice(sliceStart, sliceStart + 1)
          : start === end
          ? elements.slice(sliceStart)
          : elements.slice(sliceStart, sliceStart + 1);
      if (debug) {
        console.log("filterRuleTreeEnums", rule.name, filtered, elements);
      }
      const isRefNext = isRefTrigger || filtered[0]?.kind !== langium.Keyword;
      if (isRefNext && filtered.length > 0 && context.triggerNode === startNode) {
        const [ref] = filtered.slice(0, 1);
        if (!crossrefs.has(ref.feature)) {
          crossrefs.add(ref.feature);
          yield Object.assign([ref], {
            nameStack: elements.nameStack,
            replace: endNode && startNode ? endNode.end - startNode.end : void 0,
            addition: filtered
          }) as RuleTreeEnumYieldValue<FeatureData[]>;
          continue;
        }
      }
      if (filtered.length > 0) {
        yield Object.assign(filtered, {
          nameStack: elements.nameStack,
          replace: endNode && startNode ? endNode.end - startNode.end : void 0
        }) as RuleTreeEnumYieldValue<FeatureData[]>;
      }
      continue;
    } else if (!startNode) {
      yield elements;
    }
  }
}
export function filterRuleTree(rule: langium.ParserRule, context: WrapContext) {
  return generateRuleTreeEnum(
    rule as langium.ParserRule,
    context.root,
    context.prevRule && _utils.toConstMap([context.prevRule.rule.$refText])
  );
}

export function findLastNonHiddenNode(node: CstNode): LeafCstNode {
  const next = (node as any)?.lastNonHiddenNode;
  return (
    (next &&
      ((next as CstNode).feature.$type === langium.CrossReference
        ? next
        : findLastNonHiddenNode(next))) ||
    (node as LeafCstNode)
  );
}

export type GeneratorOrCache<T> = Generator<T> | T[];
export type AlternativesGeneratorOrCache = GeneratorOrCache<
  RuleTreeEnumYieldValue<(string | SnippetItem)[]>
>;
function wrapAllAlternativesWithCache(
  rule: langium.AbstractRule,
  context: WrapContext
): AlternativesGeneratorOrCache {
  // if (AllMap.has(rule)) {
  //   return AllMap.get(rule);
  // }
  return (function* temp() {
    const stack = [] as (string | SnippetItem)[][];
    for (const r of _wrapAllAlternatives(rule, context)) {
      stack.push(r);
      yield r;
    }
    AllMap.set(rule, stack);
  })();
  // console.groupEnd()
}

function* wrapFeatureKeywordValue(
  element: FeatureData | RuleTreeEnumYieldValue<FeatureData[]>,
  context: WrapContext,
  index?: number,
  list?: (FeatureData | FeatureData[])[]
): Generator<string | SnippetItem | (string | SnippetItem)[]> {
  if (element instanceof Array) {
    for (let index = 0; index < element.length; index++) {
      const e = element[index];
      yield* wrapFeatureKeywordValue(e, context, index, element);
    }
  } else if (element.kind === langium.Keyword) {
    yield element.feature.value;
  } else if (element.kind === langium.TerminalRule) {
    if (element.feature.name in RULE_PREVIEW) {
      yield RULE_PREVIEW[element.feature.name];
    } else {
      switch (element.feature.name) {
        default:
          yield [
            {
              kind: SnippetStringItemKind.Placeholder,
              name: element.feature.name
            } as SnippetPlaceholderItem
          ];
          break;
      }
    }
  } else if (element.kind === langium.CrossReference) {
    const type = element.feature.type.$refText;
    yield [
      {
        kind: SnippetStringItemKind.Reference,
        type,
        data: element
      } as SnippetReferenceItem
    ];
    return;
  } else if (element.kind === langium.RuleCall) {
    if (element.name in RULE_PREVIEW) {
      yield RULE_PREVIEW[element.name];
      return;
    } else if (
      !langium.isParserRule(element.feature.rule.ref) ||
      isDataTypeRule(element.feature.rule.ref)
    ) {
      // console.log("wrap isDataTypeRule", element.feature.rule.ref);
      for (const o of wrapAllAlternativesWithCache(element.feature.rule.ref, {
        ...context,
        node: null,
        triggerNode: null,
        prevRule: null
      })) {
        yield o;
      }
      return;
    }
    yield {
      kind: SnippetStringItemKind.Placeholder,
      name: `/* ${element.feature.rule.$refText} */`,
      data: element
    } as SnippetPlaceholderItem;
    // yield element;
    return;
  }
  // yield element;
  return;
}

globalThis.isDataTypeRule = isDataTypeRule;
globalThis.generateTreeEnum = generateTreeEnum;
export type RuleTreeEnumYieldValue<T> = T & {
  nameStack?: string[];
  replace?: number;
  addition?: T;
};
function extendRuleTreeEnumYieldValue<T, E>(
  a: RuleTreeEnumYieldValue<T>,
  handle: (t: T) => E
): RuleTreeEnumYieldValue<E> {
  return Object.assign(handle(a), {
    nameStack: a.nameStack,
    replace: a.replace,
    addition: a.addition && handle(a.addition)
  }) as RuleTreeEnumYieldValue<E>;
}
interface AstElementAddition {
  assignment?: langium.Assignment;
  source?: langium.AbstractElement;
}
type AstElement = langium.AbstractElement & AstElementAddition;
export interface LoopFeature {
  loopTrigger: langium.AbstractElement;
  SpaceTrigger: boolean;
  item: langium.AbstractElement;
}

export function* generateRuleTreeEnum(
  rule: langium.AbstractRule,
  rootRule: langium.AbstractRule = rule,
  blockRules?: Record<string, true>
): Generator<RuleTreeEnumYieldValue<FeatureData[]>, void, unknown> {
  const result = [];
  //
  function isIgnoreItem(item: langium.AbstractRule | AstElement | string): boolean {
    return (
      item &&
      ((IgnoreMap[rootRule.name] || IgnoreMap[rootRule.name])?.[
        typeof item === "string" ? item : (item as langium.AbstractRule).name
      ] || IgnoreMap[typeof item === "string" ? item : (item as langium.AbstractRule).name]) ===
        true
    );
  }
  const lists = new Map<langium.Group, LoopFeature>();
  const childrenSet = new WeakSet();
  const whiteSpace: NodeFilterCursor = (node, { prev, next, stack }) => {
    // if (tirmNode(node)) {
    //   if (stack.includes(ast.Character)) {
    //     if (ast.isKeyword(prev, "-") && ast.isRuleCall(next, ast.NameIdentifier)) {
    //       return [node];
    //     }
    //     if (ast.isKeyword(next, "(") && ast.isRuleCall(prev, ast.NameIdentifier)) {
    //       return [node];
    //     }
    //     return [];
    //   }
    // }
  };
  if (langium.isParserRule(rule)) {
    for (const { items: element } of generateTreeEnum<AstElement, langium.AbstractElement>(
      [rule.alternatives || (rule as any)],
      (item, { stack: ruleStack }) => {
        if (isIgnoreItem(item)) {
          return false;
        }
        // if (!langium.isAssignment(item) && lists.has(ruleStack[ruleStack.length - 1] as langium.Group)) {
        //   return [];
        // }
        let children: AstElement[][];
        if (langium.isAlternatives(item)) {
          children = item.elements.map((o) => [o]);
        } else if (langium.isGroup(item)) {
          if (
            !lists.has(item) &&
            //&& !ruleStack.some((o) => o.$type === "RuleCall") &&
            (item.cardinality === "*" || item.cardinality === "+")
          ) {
            const element = item.elements.find(
              (feature) => langium.isAssignment(feature) && feature.operator === "+="
            ) as langium.Assignment;
            if (element) {
              const loopElements = item.elements.filter(
                (feature) => !_utils.isWhiteSpaceFeature(feature)
              );
              const loopTrigger = loopElements.filter((feature) => feature !== element);
              children = [loopElements];
              const parent = ruleStack[ruleStack.length - 1];
              const sourceElement =
                langium.isGroup(parent) &&
                parent.elements.find(
                  (feature) =>
                    langium.isAssignment(feature) &&
                    feature.operator === element.operator &&
                    feature.feature === element.feature &&
                    _utils.getRuleCallName(feature.terminal) ===
                      _utils.getRuleCallName(element.terminal)
                );
              lists.set(item, {
                loopTrigger: loopTrigger[0],
                SpaceTrigger: loopTrigger.some((o) => _utils.isRuleCallType(o, ast.Space)),
                item: sourceElement || element
              });
              if (sourceElement) {
                return children;
              }
            }
          }
          children = children || [item.elements];
        } else if (langium.isAction(item)) {
          // actions.push(item.type);
        } else if (langium.isAssignment(item) && !childrenSet.has(item)) {
          if (isIgnoreItem((item.terminal as langium.RuleCall).rule?.$refText)) {
            return false;
          }
          children = [[appendCache(item.terminal, { assignment: item })]];
          if (langium.isRuleCall(item.terminal) && ast.isRequiredRuleCall(item.terminal)) {
            return children;
          }
        } else if (langium.isRuleCall(item)) {
          if (isIgnoreItem(item.rule.$refText)) {
            return false;
          }
          if (
            (!blockRules || !blockRules[item.rule.$refText]) &&
            ast.allowDeepResolveRuleCall(item, rootRule)
          ) {
            const rule = item.rule.ref;
            if (langium.isParserRule(rule)) {
              children = [[rule.alternatives]];
            } else if (langium.isTerminalRule(rule)) {
              return;
            }
          }
          // return children;
        }
        if (ast.isOptionalFeature(item as AstElement)) {
          if (children) {
            if (!children[0]?.length) return [false];
            return [false, ...children];
          } else {
            if (!childrenSet.has(item)) {
              const resolve = appendCache(item, {}) as AstElement;
              childrenSet.add(resolve);
              return [false, [resolve]];
            }
            // return [[], [{ ...item, cardinality: null }]];
          }
        }
        return children;
      },
      (item) =>
        false &&
        item.$type === langium.RuleCall &&
        (item as langium.RuleCall).rule?.$refText === ast.Token_Comma
    )) {
      const resolve =
        // trimNodes(
        element.filter((e) => {
          const refText = (e as langium.AbstractElement as langium.RuleCall).rule?.$refText;
          return !refText || !isIgnoreItem(refText);
        });
      // )
      const full = resolve.filter((feature) => !_utils.isWhiteSpaceFeature(feature));
      if (full.length) {
        function toFeatureDatas(
          list: CacheItem<
            langium.AbstractElement & AstElementAddition,
            {
              stack: AstElement[];
            }
          >[]
        ) {
          const nameStack = resolveNameStack(list);
          let matched = false,
            loop: LoopFeature;
          const result = [] as FeatureData[];
          for (let index = 0; index < list.length; index++) {
            const feature = list[index];
            const ignore = whiteSpace(
              { feature },
              {
                prev: { feature: list[index - 1] },
                next: { feature: list[index + 1] },
                stack: nameStack
              }
            );
            const group = feature.stack.find((o) => langium.isGroup(o) && lists.has(o));
            const metaInfo = lists.get(group as langium.Group);
            if (metaInfo) {
              const current = result.filter(
                (o) => o.feature === metaInfo.item || o.stack.find((o) => o === metaInfo.item)
              );
              loop = metaInfo;
              if (current.length > 0) {
                if (!matched) {
                  Object.assign(current[current.length - 1], { loop: metaInfo });
                  matched = true;
                }
                continue;
              }
            }

            for (const item of ignore || [feature]) {
              const feature = (item.source || item) as langium.AbstractElement;
              result.push({
                feature,
                kind: item.$type,
                name:
                  (feature as langium.CrossReference).type?.$refText ||
                  (feature as langium.RuleCall).rule?.$refText ||
                  (feature as langium.Keyword).value ||
                  item.$type,
                assignment: (item as AstElement).assignment,
                stack: item.stack,
                loop
              } as FeatureData);
            }
          }
          return Object.assign(result, { nameStack });
        }

        yield toFeatureDatas(resolve.filter((o) => o.$type !== langium.Action));
        result.push(resolve);
      }
    }
    // console.log("generateRuleTreeEnum", rule, result);
  } else {
    yield Object.assign(
      [{ kind: "TerminalRule", feature: rule as langium.TerminalRule, name: rule.name }],
      {
        nameStack: [rule.name]
      }
    ) as RuleTreeEnumYieldValue<FeatureData[]>;
  }

  function resolveNameStack(resolve: AstElement[]) {
    let resolveRule = false;
    let list = [rule.name];
    for (const feature of resolve) {
      if (langium.isAction(feature) && feature.type.$refText !== rule.name) {
        resolveRule = true;
        list.push(feature.type.$refText);
      }
      if (!resolveRule && feature.assignment) {
        const current = getContainerOfType(feature.assignment, langium.isParserRule);
        if (
          current &&
          current !== rule &&
          !current.fragment &&
          ast.reflection.isSubtype(current.name, rule.name)
        ) {
          resolveRule = true;
          // list.push(root.name.replace(new RegExp("^" + rule.name), ""));
          list = [current.name];
        }
      }
    }
    return list;
  }
}
function trimNodes<T extends AstElement>(nodes: T[]) {
  let allow = false;
  const result = [] as T[];
  for (let i = 0; i < nodes.length; i++) {
    if (allow || !_utils.isWhiteSpaceFeature(nodes[i])) {
      result.push(nodes[i]);
      if (nodes[i].$type !== langium.Action) allow = true;
    }
  }
  allow = false;
  const start = result.splice(0);
  for (let i = start.length - 1; i > -1; i--) {
    if (allow || !_utils.isWhiteSpaceFeature(start[i])) {
      result.unshift(start[i]);
      allow = true;
    }
  }
  return result;
}
globalThis.generateRuleTreeEnum = generateRuleTreeEnum;
globalThis.getSnippetEnumsWithRule = getSnippetEnumsWithRule;

const IgnoreMap = {
  ..._utils.toConstMap([ast.WS, ast.Pipe, ast.CommonIndent]),
  // [ast.YamlBlock]: toConstMap([ast.Declare]),
  [ast.Content]: _utils.toConstMap([ast.EOL]),
  [ast.Character]: _utils.toConstMap([ast.EOL]),
  [ast.CharactersDeclare]: _utils.toConstMap([ast.EOL]),
  [ast.Call]: _utils.toConstMap([ast.MacroParam])
};
const RULE_PREVIEW = {
  [ast.WS]: "",
  [ast.Space]: " ",
  [ast.Indent]: "",
  [ast.Outdent]: "",
  [ast.EOL]: "\r\n",
  [ast.STRING]: [
    '"',
    {
      kind: SnippetStringItemKind.Placeholder,
      name: "string"
    } as SnippetItem,
    '"'
  ],
  [ast.NUMBER]: {
    kind: SnippetStringItemKind.Placeholder,
    name: "0"
  } as SnippetPlaceholderItem,
  [ast.LabelContent]: {
    kind: SnippetStringItemKind.Placeholder,
    name: "content"
  } as SnippetItem,
  [ast.ID]: {
    kind: SnippetStringItemKind.Placeholder,
    name: "name"
  } as SnippetItem,
  [ast.Identifier]: {
    kind: SnippetStringItemKind.Placeholder,
    name: "name"
  } as SnippetItem,
  [ast.NameIdentifier]: {
    kind: SnippetStringItemKind.Placeholder,
    name: "name"
  } as SnippetItem,
  [ast.INLINE_COMMENT]: [
    "[[",
    {
      kind: SnippetStringItemKind.Placeholder,
      name: "INLINE_COMMENT"
    } as SnippetItem,
    "]]"
  ],
  [ast.DocumentContents]: [
    {
      kind: SnippetStringItemKind.Variable,
      type: SnippetVariables.LINE_COMMENT
    } as SnippetItem,
    {
      kind: SnippetStringItemKind.Placeholder,
      name: " content"
    } as SnippetItem,
    "\r\n"
  ],
  [ast.TopExpression]: [
    {
      kind: SnippetStringItemKind.Placeholder,
      name: "0"
    } as SnippetItem
  ],
  [ast.Expression]: [
    {
      kind: SnippetStringItemKind.Placeholder,
      name: "0"
    } as SnippetItem
  ],
  [ast.LiteralExpression]: [
    {
      kind: SnippetStringItemKind.Placeholder,
      name: "0"
    } as SnippetItem
  ],
  [ast.Content]: [
    {
      kind: SnippetStringItemKind.Placeholder,
      name: "content..."
    } as SnippetItem,
    "\r\n"
  ]
};
interface NodeFilterCursorParam<T> {
  feature: T;
  node?: CstNode;
}
type NodeFilterCursor = <T>(
  node: NodeFilterCursorParam<T>,
  context: {
    prev?: NodeFilterCursorParam<T>;
    next?: NodeFilterCursorParam<T>;
    stack: string[];
  }
) => T[] | void;

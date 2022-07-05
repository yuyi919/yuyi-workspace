/* eslint-disable prefer-const */
import { createToken, ITokenConfig, TokenType } from "chevrotain";
import * as langium from "langium";
import { CompositeCstNodeImpl } from "langium/lib/parser/cst-node-builder";
import { cloneDeep } from "lodash";

export interface TokenTypeWrapper {
  cloneToken: (
    name: string | TokenType,
    merge?: Partial<TokenType> | ((token: TokenType) => Partial<TokenType>)
  ) => TokenType;
}

export function cloneTokens(
  tokens: Map<string, TokenType>,
  warp: (helper: TokenTypeWrapper) => TokenType[],
  debugName?: string
) {
  const clonedTokenMap = new Map<TokenType, TokenType>();
  const result = warp({
    cloneToken(
      name: string | TokenType,
      merge?: Partial<TokenType> | ((token: TokenType) => Partial<TokenType>)
    ): TokenType {
      const token = typeof name === "string" ? tokens.get(name) : name;
      const next = (merge instanceof Function ? merge(token) : merge) || {};
      // return Object.assign(token, merge);
      try {
        // const config: ITokenConfig = {
        //   categories: [token],
        //   name: next.name ?? token.name,
        //   group: next.GROUP ?? token.GROUP,
        //   start_chars_hint: next.START_CHARS_HINT ?? token.START_CHARS_HINT,
        //   pattern: next.PATTERN ?? token.PATTERN,
        //   pop_mode: next.POP_MODE ?? token.POP_MODE,
        //   push_mode: next.PUSH_MODE ?? token.PUSH_MODE,
        //   line_breaks: next.LINE_BREAKS ?? token.LINE_BREAKS,
        //   label: next.LABEL ?? token.LABEL,
        //   longer_alt: next.LONGER_ALT ?? token.LONGER_ALT
        // };
        // const categories = next.CATEGORIES?.length
        //   ? next.CATEGORIES
        //   : token.CATEGORIES?.length
        //   ? token.CATEGORIES
        //   : void 0;
        // if (categories) {
        //   config.categories = categories;
        // }
        const clonedToken = {
          ...token,
          ...next
        };
        Object.defineProperties(clonedToken, {
          LONGER_ALT: {
            get() {
              // console.log("getLongerAlt");
              return (
                ((next.LONGER_ALT || token.LONGER_ALT) as TokenType[])
                  ?.map((type) => {
                    return clonedTokenMap.get(type) || result.find((o) => o.name === type.name);
                  })
                  .filter(Boolean) || []
              );
            },
            configurable: true,
            enumerable: true
          }
        });
        clonedTokenMap.set(token, clonedToken);
        return clonedToken;
      } catch (error) {
        console.error(error, token, next);
        return token;
      }
    }
  }).filter(Boolean);
  // console.log("result:", result);
  const clonedTokens = result.map((token) => {
    Object.defineProperty(token, "LONGER_ALT", {
      value: token.LONGER_ALT
    });
    // token.LABEL = debugName
    setDebuggerName(token, debugName);
    return token;
  });
  // console.log("clonedTokens:", clonedTokens);
  return clonedTokens;
}

export function getDebuggerName(token: any): string | undefined {
  return (token as any).__debuggername;
}

export function setDebuggerName(token: any, debugName: string) {
  Object.defineProperties(token, {
    __debuggername: {
      value: debugName,
      enumerable: false,
      configurable: true
    }
  });
}

export function enum2Array(types: Record<string | number, any>) {
  return Object.freeze(
    Object.entries(types).reduce((result, [key, value]) => {
      if (parseInt(key) > -1) {
        result[key] = value;
      }
      return result;
    }, [] as string[])
  );
}

export function toCacheMap<K extends string>(keys: K[]): Record<K, number>;
export function toCacheMap<K extends string>(keys: ReadonlyArray<K>): Record<K, number>;
export function toCacheMap<K extends string>(keys: K[]) {
  return Object.freeze(
    keys.reduce((r, k, index) => ({ ...r, [k]: index }), {} as Record<K, number>)
  );
}
export function toConstMap<K extends string>(keys: K[]): Record<K, true>;
export function toConstMap<K extends string>(keys: ReadonlyArray<K>): Record<K, true>;
export function toConstMap<K extends string>(keys: K[]) {
  return Object.freeze(keys.reduce((r, k, index) => ({ ...r, [k]: true }), {} as Record<K, true>));
}

/**
 * This `internal` declared method exists, as we want to find the first child with the specified feature.
 * When the own feature is named the same by accident, we will instead return the input value.
 * Therefore, we skip the first assignment check.
 * @param node - The node to traverse/check for the specified feature
 * @param feature - The specified feature to find
 * @param element - The element of the initial node. Do not process nodes of other elements.
 * @param first - Whether this is the first node of the whole check.
 * @returns A list of all nodes within this node that belong to the specified feature.
 */
export function findNodesForFeature(
  node: langium.CstNode,
  feature: langium.ParserRule | langium.CrossReference,
  offset?: number,
  element?: langium.AstNode,
  first = true
): langium.CstNode[] {
  if (
    !node ||
    !feature ||
    (offset && node.offset <= offset) ||
    (element && node.element !== element)
  ) {
    return [];
  }
  const nodeFeature =
    (langium.isRuleCall(node.feature) && node.feature.rule.ref) ||
    (langium.isCrossReference(node.feature) && node.feature);
  if (!first && nodeFeature) {
    if (nodeFeature === feature) {
      return [node];
    }
    const nodeFeatureName = findPropertyId(nodeFeature);
    const featureName = findPropertyId(feature);
    // console.log("findNodesForFeature", nodeFeature, node, nodeFeatureName, featureName);
    if (nodeFeatureName === featureName) {
      console.log("match", nodeFeature, node);
      return [node];
    }
  }
  if (node instanceof CompositeCstNodeImpl) {
    const children = node.children;
    const result = children.flatMap((e) => findNodesForFeature(e, feature, offset, element, false));
    // return children.length === 1 && result.length === 1 ? [node] : result
    return result;
  }
  return [];
}

export function findPropertyId(node: langium.AstNode): string {
  const assignment = langium.getContainerOfType(node, langium.isAssignment);
  if (!assignment)
    if (langium.isRuleCall(node)) {
      return node.rule.$refText;
    } else if (langium.isParserRule(node)) {
      return node.name;
    }
  const parserRule = langium.getContainerOfType(node, langium.isParserRule);
  if (assignment && parserRule) {
    return `${langium.getTypeNameAtElement(parserRule, assignment)}:${assignment.feature}`;
  }
}

export function getContainerOfTypeUntil<T extends langium.AstNode>(
  node: langium.AstNode,
  typePredicate: (n: langium.AstNode) => n is T,
  until: (n: langium.AstNode) => boolean
): T {
  let item = node;
  while (item) {
    if (typePredicate(item)) {
      return item;
    }
    item = item.$container;
    if (until(item)) {
      break;
    }
  }
  return undefined;
}

export function findAllFeatures(
  rule: langium.AbstractElement | langium.ParserRule
): langium.AbstractElement[] {
  let features = new Set<langium.AbstractElement>();
  let nextFeatures = langium.findFirstFeatures(
    langium.isParserRule(rule) ? rule.alternatives : rule
  );
  while (nextFeatures.length > 0) {
    nextFeatures.forEach((e) => {
      features.add(e);
    });
    nextFeatures = langium.findNextFeatures(nextFeatures);
  }
  return Array.from(features);
}

export function findCommonSuperRule(
  node: langium.CstNode,
  wrap
): { rule: langium.ParserRule; node: langium.CstNode; feature: langium.RuleCall } {
  let superNode = wrap(node);
  if (superNode) {
    console.log("findCommonSuperRule", superNode);
    const topFeature = superNode.feature;
    if (langium.isRuleCall(topFeature) && topFeature.rule.ref) {
      const rule = topFeature.rule.ref as langium.ParserRule;
      return { rule, node: superNode, feature: topFeature };
    }
  }
}
export function findNodeForFeature(
  node: langium.CstNode,
  feature: langium.ParserRule | langium.CrossReference,
  offset?: number,
  astNode?: langium.AstNode,
  index?: number
): langium.CstNode {
  const nodes = findNodesForFeature(node, feature, offset, astNode);
  // console.log(Array.from(flattenCstGen(node)))
  if (nodes.length === 0) {
    return undefined;
  }
  if (index !== undefined) {
    index = Math.max(0, Math.min(index, nodes.length - 1));
  } else {
    index = 0;
  }
  return nodes[index];
}

export function findNodeWithFeature(
  cstNode: langium.CstNode,
  feature: langium.ParserRule | langium.CrossReference,
  offset?: number
): langium.CstNode {
  // console.groupCollapsed("findNodeWithFeature", cstNode, feature);
  let n: langium.CstNode = cstNode,
    element = findNodeForFeature(n, feature, offset);
  // console.log("result", element);
  // console.groupEnd();
  return element;
}

export function findNodesWithFeature(
  cstNode: langium.CstNode,
  feature: langium.ParserRule | langium.CrossReference
): langium.CstNode[] {
  console.groupCollapsed("findNodesWithFeature", cstNode, feature);
  const element: langium.CstNode[] = findNodesForFeature(cstNode, feature);
  console.log("result", element);
  console.groupEnd();
  return element;
}

export function isParserRuleOrCrossReference(
  e: langium.AbstractElement | langium.AbstractRule
): e is langium.ParserRule | langium.CrossReference {
  return langium.isParserRule(e) || langium.isCrossReference(e);
}

export function isStringFeature(node: langium.AbstractElement | langium.AbstractRule) {
  if (langium.isCrossReference(node)) {
    return isStringFeature(node.terminal);
  }
  if (langium.isRuleCall(node)) {
    return node.rule.ref && isStringFeature(node.rule.ref);
  }
  if (langium.isParserRule(node) || langium.isTerminalRule(node)) {
    return node.$type === "string";
  }
  return false;
}
export * from "./cst-node-utils";

// import * as cstUtils from "./cst-node-utils";
// globalThis.cstUtils = cstUtils;

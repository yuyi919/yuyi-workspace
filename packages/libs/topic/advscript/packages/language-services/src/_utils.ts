/* eslint-disable prefer-const */
import { TokenType } from "chevrotain";
import * as langium from "langium";
import {
  CompositeCstNodeImpl,
  LeafCstNodeImpl,
  RootCstNodeImpl,
} from "langium/lib/parser/cst-node-builder";
import { cloneDeep } from "lodash";

export type TokenTypeWrapper = {
  cloneToken: (
    name: string | TokenType,
    merge?: Partial<TokenType> | ((token: TokenType) => Partial<TokenType>)
  ) => TokenType;
};

export function cloneTokens(
  tokens: Map<string, TokenType>,
  warp: (helper: TokenTypeWrapper) => TokenType[]
) {
  const clonedTokenMap = new Map<TokenType, TokenType>();
  const result = warp({
    cloneToken(
      name: string | TokenType,
      merge?: Partial<TokenType> | ((token: TokenType) => Partial<TokenType>)
    ): TokenType {
      const token = typeof name === "string" ? tokens.get(name) : name;
      // return Object.assign(token, merge);
      const next = (merge instanceof Function ? merge(token) : merge) || {};
      const clonedToken = {
        ...token,
        ...next,
        get LONGER_ALT() {
          return (
            ((next.LONGER_ALT || token.LONGER_ALT) as TokenType[])
              ?.map((type) => {
                return clonedTokenMap.get(type) || result.find((o) => o.name === type.name);
              })
              .filter(Boolean) || []
          );
        },
      };
      clonedTokenMap.set(token, clonedToken);
      return clonedToken;
    },
  }).filter(Boolean);
  console.log(result);
  return cloneDeep(result);
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

export function isLeafCstNode(node: unknown): node is langium.LeafCstNode {
  return node instanceof LeafCstNodeImpl;
}
export function isCompositeCstNode(node: unknown): node is langium.CompositeCstNode {
  return node instanceof CompositeCstNodeImpl;
}

// type AstToken = {
//   astNode: AstNode,
//   cstNode: LeafCstNode | CompositeCstNode,
//   type: "ref" | "leafCst" | "CompositeCst"
// }
export function* flattenCstGen(
  node: langium.CstNode
): Generator<langium.LeafCstNode | langium.CompositeCstNode, void, void> {
  if (node instanceof LeafCstNodeImpl) {
    yield node;
  } else if (node instanceof CompositeCstNodeImpl) {
    if (langium.isCrossReference(node.feature)) {
      yield node;
    } else if (
      node.children.length > 1 &&
      langium.isRuleCall(node.feature) &&
      langium.isParserRule(node.feature.rule.ref) &&
      node.feature.rule.ref.type === "string"
    ) {
      yield node;
    } else {
      const list = node.children,
        length = list.length;

      let i = -1,
        item: langium.CstNode;
      while (++i < length) {
        item = list[i];
        yield* flattenCstGen(item);
      }
    }
  }
}

enum GeneratorType {}

function* createCstGeneratorInternal(
  node: langium.CstNode,
  indexInParent: number = 0,
  mode = 0
): Generator<
  { node: langium.LeafCstNode | langium.CompositeCstNode; indexInParent: number },
  void,
  void
> {
  if (node instanceof LeafCstNodeImpl) {
    yield { node, indexInParent };
  } else if (node instanceof CompositeCstNodeImpl) {
    yield { node, indexInParent };
    const list = node.children,
      length = list.length;
    let i = -1,
      item: langium.CstNode;
    while (++i < length) {
      item = list[i];
      yield* createCstGeneratorInternal(item, i, mode);
    }
  }
}

const documentMap = new WeakMap<
  langium.AstNode,
  {
    node: langium.CompositeCstNode | langium.LeafCstNode;
    indexInParent: number;
  }[]
>();

export function getRoot(node: langium.CstNode) {
  return node instanceof RootCstNodeImpl ? node.element : node.root.element;
}
export function* createCstGenerator(node: langium.CstNode): Generator<
  {
    node: langium.LeafCstNode | langium.CompositeCstNode;
    indexInParent: number;
    indexInRoot: number;
  },
  void,
  void
> {
  // const doc = getRoot(node);
  let index = -1;
  // if (doc && documentMap.has(doc)) {
  //   for (const item of documentMap.get(doc)) {
  //     yield Object.assign(item, { indexInRoot: ++index });
  //   }
  //   return;
  // }
  const cacheList = [];
  for (const item of createCstGeneratorInternal(node, 0)) {
    yield Object.assign(item, { indexInRoot: ++index });
  }
  // documentMap.set(doc, cacheList);
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
  return Object.freeze(
    keys.reduce((r, k, index) => ({ ...r, [k]: true }), {} as Record<K, true>)
  );
}

export function findInputNode(cst: langium.CstNode, prevTokenOffset: number) {
  // console.log(documentMap, getRoot(cst), documentMap.get(getRoot(cst)));
  const inputNode = findWordNodeAtOffset(cst, prevTokenOffset);
  let node = inputNode;
  if (isNaN(node.offset) || node.hidden || isKeywordLeafNode(node, "WS")) {
    // console.time("prevCstStack");
    for (node of findPrevTokenNode2(inputNode)) {
      if (!isNaN(node.end) && !node.hidden && !isKeywordLeafNode(node, "WS")) {
        break;
      }
    }
    // console.timeEnd("prevCstStack");
    // console.log(node);
  }
  return { node, inputNode };
}

export function findIdentifierNode(
  cst: langium.CstNode,
  offset: number
): {
  node?: langium.CstNode | undefined;
  inputNode: langium.CstNode;
  isMismatchToken?: boolean;
} {
  const inputNode = findWordNodeAtOffset(cst, offset);
  let node = inputNode;
  // console.log(documentMap, getRoot(cst), documentMap.get(getRoot(cst)));
  let prev: langium.CstNode;
  for (const { node, isMismatchToken } of searchWordNodeWithOffset(cst, offset)) {
    if (isMismatchToken) {
      if (!prev || prev.offset === node.end || prev.offset === offset) {
        return { node, inputNode, isMismatchToken };
      }
    } else {
      // console.log(node, offset);
      if (node.end < offset) return { inputNode };
      if (!isNaN(node.end) && isKeywordLeafNode(node, "ID")) {
        break;
      }
    }
    prev = node;
  }
  return { node, inputNode };
}

export function isKeywordLeafNode(
  node: langium.CstNode,
  name?: string
): node is langium.LeafCstNode {
  return node instanceof LeafCstNodeImpl && (!name || node.tokenType.name === name);
}

export function findWordNodeAtOffset(
  node: langium.CstNode,
  offset: number
): langium.CstNode | undefined {
  if (node instanceof LeafCstNodeImpl) {
    return node;
  } else if (node instanceof CompositeCstNodeImpl) {
    if (langium.isCrossReference(node.feature)) {
      const children = node.children.filter((e) => e.offset <= offset).reverse();
      for (const child of children) {
        const result = findWordNodeAtOffset(child, offset);
        if (result) {
          return node; //.parent.children[node.parent.children.indexOf(node) - 1] as CstNode;
        }
      }
      // return node
    } else if (
      node.children.length > 1 &&
      langium.isRuleCall(node.feature) &&
      langium.isParserRule(node.feature.rule.ref) &&
      node.feature.rule.ref.type === "string"
    ) {
      const children = node.children.filter((e) => e.offset <= offset).reverse();
      for (const child of children) {
        const result = findWordNodeAtOffset(child, offset);
        if (result) {
          return node; //.parent.children[node.parent.children.indexOf(node) - 1] as CstNode;
        }
      }
      // return node
    }
    const children = node.children.filter((e) => e.offset <= offset).reverse();
    for (const child of children) {
      const result = findWordNodeAtOffset(child, offset);
      if (result) {
        return result;
      }
    }
  }
  return undefined;
}

export function* searchWordNodeWithOffset(
  node: langium.CstNode,
  offset: number
): Generator<{ node: LeafCstNodeImpl | langium.CompositeCstNode; isMismatchToken?: true }> {
  if (node instanceof LeafCstNodeImpl && node.offset <= offset && node.end >= offset) {
    yield { node };
  } else if (node instanceof CompositeCstNodeImpl && node.offset <= offset) {
    const length = node.children.length;
    if (!length) {
      yield { node, isMismatchToken: true };
    } else {
      let i = length;
      while (--i > -1) {
        yield* searchWordNodeWithOffset(node.children[i], offset);
      }
    }
  }
}

export function findRealCompositeCstNode(node: langium.CompositeCstNode | langium.LeafCstNode) {
  if (node instanceof LeafCstNodeImpl) {
    if (typeof node.offset === "number" && !isNaN(node.offset)) {
      return node;
    }
    node = node.parent as langium.CompositeCstNode;
  }
  let com = node as langium.CompositeCstNode;
  while (com && com.children.length <= 1) {
    com = com.parent;
  }
  return com;
}

// export function findPrevTokenNode(node: CstNode, offset: number): CstNode | undefined {
//   node = findWordNodeAtOffset(node, offset);
//   // console.log("findLeafNodeAtOffset", node);
//   if (isCrossReference(node.feature)) {
//     let match: CstNode, current: CstNode, parent: CompositeCstNode;
//     do {
//       current = parent || node;
//       parent = current.parent;
//       let index = 1;
//       do {
//         match = parent.children[parent.children.indexOf(current) - index++];
//       } while (match instanceof LeafCstNodeImpl && match.tokenType.name === "WS");
//     } while (!match);
//     if (match instanceof CompositeCstNodeImpl) {
//       // @ts-expect-error
//       match = match.lastNonHiddenNode;
//     }
//     return match;
//   }
//   return node;
// }
export function findPrevTokenNode(node: langium.CstNode): langium.CstNode | undefined {
  // console.log("findLeafNodeAtOffset", node);
  let match: langium.CstNode,
    current: langium.CstNode = node,
    parent: langium.CompositeCstNode;
  do {
    parent = current.parent;
    if (!parent) break;
    const currentIndex = current.indexInParent ?? parent.children.indexOf(current);
    let index = 0;
    do {
      match = parent.children[currentIndex - ++index];
    } while (match && match.offset !== match.offset);
    current = parent;
  } while (current?.parent && !match);
  if (match instanceof CompositeCstNodeImpl) {
    let current: langium.CstNode;
    for (const child of flattenCstGen(match)) {
      if (child === node) {
        break;
      }
      if (child.end === child.end) current = child;
    }
    return current; //findLastValidNode(match);
  }
  return match;
}
export function* findPrevTokenNode2(node: langium.CstNode): Generator<langium.CstNode> {
  // console.log("findLeafNodeAtOffset", node);
  let e = node;
  while (e) {
    e = findPrevTokenNode(e);
    if (e) {
      yield e;
    }
  }
}

export function findLastValidNode(target: langium.CompositeCstNode): langium.CstNode | undefined {
  for (let i = target.children.length - 1; i >= 0; i--) {
    const child = target.children[i];
    // 确保是解析成功的节点
    if (!child.hidden && child.end === child.end) {
      return child;
    }
  }
}
export function findNextTokenNode(
  node: langium.CstNode,
  offset: number
): langium.CstNode | undefined {
  node = findWordNodeAtOffset(node, offset);
  // console.log("findLeafNodeAtOffset", node);
  if (langium.isCrossReference(node.feature)) {
    let match: langium.CstNode,
      current: langium.CstNode,
      parent: langium.CompositeCstNode,
      matched = true;
    do {
      current = parent || node;
      parent = current.parent;
      // if (!matched) {
      //   matched = true
      match = parent.children[parent.children.indexOf(current) + 1];
      // } else {
      //   match = parent
      // }
    } while (!match);
    if (match instanceof CompositeCstNodeImpl) {
      // @ts-expect-error
      match = match.firstNonHiddenNode;
    }
    return match;
  }
  return node;
}
/**
 * This `internal` declared method exists, as we want to find the first child with the specified feature.
 * When the own feature is named the same by accident, we will instead return the input value.
 * Therefore, we skip the first assignment check.
 * @param node The node to traverse/check for the specified feature
 * @param feature The specified feature to find
 * @param element The element of the initial node. Do not process nodes of other elements.
 * @param first Whether this is the first node of the whole check.
 * @returns A list of all nodes within this node that belong to the specified feature.
 */
export function findNodesForFeature(
  node: langium.CstNode | undefined,
  feature: langium.ParserRule | langium.CrossReference | undefined,
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
  node: langium.AstNode | undefined,
  typePredicate: (n: langium.AstNode) => n is T,
  until: (n: langium.AstNode) => boolean
): T | undefined {
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
): { rule: langium.ParserRule; node: langium.CstNode } | undefined {
  let superNode = wrap(node);
  if (superNode) {
    console.log("findCommonSuperRule", superNode);
    const topFeature = superNode.feature;
    if (langium.isRuleCall(topFeature) && topFeature.rule.ref) {
      const rule = <langium.ParserRule>topFeature.rule.ref;
      return { rule, node: superNode };
    }
  }
}
export function findNodeForFeature(
  node: langium.CstNode | undefined,
  feature: langium.ParserRule | langium.CrossReference | undefined,
  offset?: number,
  astNode?: langium.AstNode,
  index?: number
): langium.CstNode | undefined {
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
): langium.CstNode | undefined {
  // console.groupCollapsed("findNodeWithFeature", cstNode, feature);
  let n: langium.CstNode | undefined = cstNode,
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
    return node.type === "string";
  }
  return false;
}

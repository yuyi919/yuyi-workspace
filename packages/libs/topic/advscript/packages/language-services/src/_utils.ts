/* eslint-disable prefer-const */
import { TokenType } from "chevrotain";
import {
  AstNode,
  CompositeCstNode,
  CstNode,
  isCrossReference,
  isParserRule,
  isRuleCall,
  LeafCstNode,
  findLeafNodeAtOffset as _findLeafNodeAtOffset,
  findLeafNodeAtOffset,
  getContainerOfType,
} from "langium";
import { CompositeCstNodeImpl, LeafCstNodeImpl } from "langium/lib/parser/cst-node-builder";

export function cloneTokens(
  tokens: Map<string, TokenType>,
  warp: (helper: {
    cloneToken: (
      name: string | TokenType,
      merge?: Partial<TokenType> | ((token: TokenType) => Partial<TokenType>)
    ) => TokenType;
  }) => TokenType[]
) {
  const clonedTokenMap = new Map<TokenType, TokenType>();
  return warp({
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
          return ((next.LONGER_ALT || token.LONGER_ALT) as TokenType[])?.map((type) => {
            return clonedTokenMap.get(type) || type;
          });
        },
      };
      clonedTokenMap.set(token, clonedToken);
      return clonedToken;
    },
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

export function isLeafCstNode(node: unknown): node is LeafCstNode {
  return node instanceof LeafCstNodeImpl;
}
export function isCompositeCstNode(node: unknown): node is CompositeCstNode {
  return node instanceof CompositeCstNodeImpl;
}

// type AstToken = {
//   astNode: AstNode,
//   cstNode: LeafCstNode | CompositeCstNode,
//   type: "ref" | "leafCst" | "CompositeCst"
// }
export function* flattenCstGen(
  node: CstNode
): Generator<LeafCstNode | CompositeCstNode, void, void> {
  if (node instanceof LeafCstNodeImpl) {
    yield node;
  } else if (node instanceof CompositeCstNodeImpl) {
    if (isCrossReference(node.feature)) {
      yield node;
    } else if (
      node.children.length > 1 &&
      isRuleCall(node.feature) &&
      isParserRule(node.feature.rule.ref) &&
      node.feature.rule.ref.type === "string"
    ) {
      yield node;
    } else {
      const list = node.children,
        length = list.length;

      let i = -1,
        item: CstNode;
      while (++i < length) {
        item = list[i];
        yield* flattenCstGen(item);
      }
    }
  }
}

export function toCacheMap<K extends string>(keys: K[]): Record<K, number>;
export function toCacheMap<K extends string>(keys: ReadonlyArray<K>): Record<K, number>;
export function toCacheMap<K extends string>(keys: K[]) {
  return Object.freeze(
    keys.reduce((r, k, index) => ({ ...r, [k]: index }), {} as Record<K, number>)
  );
}

export function findWordNodeAtOffset(node: CstNode, offset: number): CstNode | undefined {
  if (node instanceof LeafCstNodeImpl && node.tokenType.name !== "WS") {
    return node;
  } else if (node instanceof CompositeCstNodeImpl) {
    if (isCrossReference(node.feature)) {
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
      isRuleCall(node.feature) &&
      isParserRule(node.feature.rule.ref) &&
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

export function findPrevTokenNode(node: CstNode, offset: number): CstNode | undefined {
  node = findWordNodeAtOffset(node, offset);
  console.log("findLeafNodeAtOffset", node);
  if (isCrossReference(node.feature)) {
    let match: CstNode,
      current: CstNode,
      parent: CompositeCstNode,
      matched = true;
    do {
      current = parent || node;
      parent = current.parent;
      // if (!matched) {
      //   matched = true
      match = parent.children[parent.children.indexOf(current) - 1];
      // } else {
      //   match = parent
      // }
    } while (!match);
    if (match instanceof CompositeCstNodeImpl) {
      // @ts-expect-error
      match = match.lastNonHiddenNode;
    }
    return match;
  }
  return node;
}

export function findNextTokenNode(node: CstNode, offset: number): CstNode | undefined {
  node = findWordNodeAtOffset(node, offset);
  console.log("findLeafNodeAtOffset", node);
  if (isCrossReference(node.feature)) {
    let match: CstNode,
      current: CstNode,
      parent: CompositeCstNode,
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
  node: CstNode | undefined,
  feature: string | undefined,
  element = node.element,
  first = true
): CstNode[] {
  if (!node || !feature || node.element !== element) {
    return [];
  }
  const nodeFeature = isRuleCall(node.feature) && node.feature.rule.ref;
  if (!first && nodeFeature && nodeFeature.name === feature) {
    return [node];
  } else if (node instanceof CompositeCstNodeImpl) {
    return node.children.flatMap((e) => findNodesForFeature(e, feature, element, false));
  }
  return [];
}

export function findNodeForFeature(
  node: CstNode | undefined,
  feature: string | undefined,
  index?: number
): CstNode | undefined {
  const nodes = findNodesForFeature(node, feature, node.element);
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

export function findNodeWithFeature(cstNode: CstNode, feature: string): CstNode | undefined {
  let n: CstNode | undefined = cstNode;
  do {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = findNodeForFeature(n, feature);
    if (element) {
      return element;
    }
    n = n.parent;
  } while (n);
  return undefined;
}

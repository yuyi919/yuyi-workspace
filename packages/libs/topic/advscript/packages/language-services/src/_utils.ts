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

export function findLeafNodeAtOffset(
  node: CstNode,
  offset: number
): LeafCstNode | CompositeCstNodeImpl | undefined {
  if (node instanceof LeafCstNodeImpl) {
    return node;
  } else if (node instanceof CompositeCstNodeImpl) {
    if (isCrossReference(node.feature)) {
      return node;
    } else if (
      node.children.length > 1 &&
      isRuleCall(node.feature) &&
      isParserRule(node.feature.rule.ref) &&
      node.feature.rule.ref.type === "string"
    ) {
      return node;
    } else if (node instanceof CompositeCstNodeImpl) {
      const children = node.children.filter((e) => e.offset <= offset).reverse();
      for (const child of children) {
        const result = findLeafNodeAtOffset(child, offset);
        if (result) {
          return result;
        }
      }
    }
  }
  return undefined;
}

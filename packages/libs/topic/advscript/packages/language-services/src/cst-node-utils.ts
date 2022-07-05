/* eslint-disable no-unmodified-loop-condition */
/* eslint-disable prefer-const */
import { TokenType } from "chevrotain";
import * as langium from "langium";
import {
  CompositeCstNodeImpl,
  LeafCstNodeImpl,
  RootCstNodeImpl
} from "langium/lib/parser/cst-node-builder";
import * as ast from "./ast-utils";
import { toConstMap } from "./_utils";

const enum GeneratorType {
  Leaf,
  Composite
}

function markMismatchTokenNode(node: langium.LeafCstNode) {
  //@ts-ignore
  node._miss = true;
}

function isMarkedMismatchTokenNode(node: langium.CstNode): node is LeafCstNodeImpl {
  //@ts-ignore
  return node._miss === true;
}

export function getContainerOfCstNode(
  node: langium.CstNode | undefined,
  typePredicate: (n: langium.CstNode) => boolean
): langium.CstNode {
  let item = node;
  while (item) {
    if (typePredicate(item)) {
      return item;
    }
    item = item.parent;
  }
  return undefined;
}
export function* searchContainerOfCstNode(node: langium.CstNode | undefined) {
  let item = node;
  while (item) {
    yield item;
    item = item.parent;
  }
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
  let prevLeaf: LeafCstNodeImpl, prevComposite: langium.CstNode;
  const cacheList = [];
  for (const item of createCstGeneratorInternal(node, 0)) {
    if (item.node) {
      if (GeneratorType.Leaf === item.kind) {
        if (prevLeaf) {
          if (item.node.offset !== item.node.offset) {
            // @ts-ignore
            item.node._offset = prevLeaf.end;
            markMismatchTokenNode(item.node);
          }
        }
        prevLeaf = item.node as LeafCstNodeImpl;
      } else {
        if (!item.node.children.length) {
          try {
            let leafNode: LeafCstNodeImpl;
            if (prevLeaf) {
              leafNode = new LeafCstNodeImpl(
                prevLeaf.end,
                0,
                { start: prevLeaf.range.end, end: prevLeaf.range.end },
                void 0,
                false
              );
            } else {
              leafNode = new LeafCstNodeImpl(
                node.offset,
                0,
                { start: node.range.start, end: node.range.start },
                void 0,
                false
              );
            }
            item.node.children.push(leafNode);
            leafNode.root = ((prevLeaf || prevComposite)?.root || node) as RootCstNodeImpl;
          } catch (error) {
            console.error(error);
          }
        }
        prevComposite = item.node;
      }

      cacheList.push(item.node);
      Object.defineProperties(
        item.node,
        Object.getOwnPropertyDescriptors({
          get next() {
            return findNextTokenNode(this, true);
          },
          get prev() {
            return findPrevTokenNode(this, true);
          }
        })
      );
      yield Object.assign(item, { indexInRoot: ++index });
    }
  }
  // documentMap.set(doc, cacheList);
}
function* createCstGeneratorInternal(
  node: langium.CstNode,
  indexInParent: number = 0,
  mode = 0
): Generator<
  | { kind: GeneratorType.Leaf; node: langium.LeafCstNode; indexInParent: number }
  | { kind: GeneratorType.Composite; node: langium.CompositeCstNode; indexInParent: number },
  void,
  void
> {
  if (isLeafCstNode(node)) {
    yield { node, indexInParent, kind: GeneratorType.Leaf };
  } else if (isCompositeCstNode(node)) {
    yield { node, indexInParent, kind: GeneratorType.Composite };
    const list = node.children.sort((a, b) =>
        a.offset === 0 || b.offset === 0 ? 0 : a.offset - b.offset
      ),
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

export function checkLeafNodeTokenType(
  node: langium.CstNode,
  name?: string
): node is langium.LeafCstNode {
  return isLeafCstNode(node) && (!name || node.tokenType.name === name);
}

export function isLeafCstNode(node: unknown): node is LeafCstNodeImpl {
  return node instanceof LeafCstNodeImpl;
}
export function isCompositeCstNode(node: unknown): node is CompositeCstNodeImpl {
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
  if (isLeafCstNode(node)) {
    yield node;
  } else if (isCompositeCstNode(node)) {
    if (langium.isCrossReference(node.feature)) {
      yield node;
    } else if (
      node.children.length > 1 &&
      langium.isRuleCall(node.feature) &&
      langium.isParserRule(node.feature.rule.ref) &&
      node.feature.rule.ref.$type === "string"
    ) {
      yield node;
    } else {
      const list = node.children,
        length = list.length;
      let i = -1;
      while (++i < length) {
        yield* flattenCstGen(list[i]);
      }
    }
  }
}
export function* findCstGen(
  node: langium.CstNode
): Generator<langium.LeafCstNode | langium.CompositeCstNode, void, void> {
  if (isLeafCstNode(node)) {
    yield node;
  } else if (isCompositeCstNode(node)) {
    if (langium.isCrossReference(node.feature)) {
      yield node;
    } else {
      const list = node.children,
        length = list.length;
      let i = -1,
        item: langium.CstNode;
      while (++i < length) {
        item = list[i];
        yield* findCstGen(item);
      }
    }
  }
}
export function* findLastCstGen(
  node: langium.CstNode
): Generator<langium.LeafCstNode | langium.CompositeCstNode, void, void> {
  if (isLeafCstNode(node)) {
    yield node;
  } else if (isCompositeCstNode(node)) {
    if (langium.isCrossReference(node.feature)) {
      yield node;
    } else {
      const list = node.children,
        length = list.length;
      let i = length;
      while (--i > -1) {
        yield* findLastCstGen(list[i]);
      }
    }
  }
}

export function getRoot(node: langium.CstNode) {
  return node instanceof RootCstNodeImpl ? node.element : node.root.element;
}

// export function findInputNode(cst: langium.CstNode, prevTokenOffset: number) {
//   // console.log(documentMap, getRoot(cst), documentMap.get(getRoot(cst)));
//   const inputNode = findWordNodeAtOffset(cst, prevTokenOffset);
//   let node = inputNode;
//   if (isNaN(node.offset) || node.hidden || checkLeafNodeTokenType(node, "WS")) {
//     // console.time("prevCstStack");
//     for (node of searchPrevTokenNode(inputNode)) {
//       if (!isNaN(node.end) && !node.hidden && !checkLeafNodeTokenType(node, "WS")) {
//         break;
//       }
//     }
//     // console.timeEnd("prevCstStack");
//     // console.log(node);
//   }
//   return { node, inputNode };
// }

export function findInputNode(cst: langium.CstNode, triggerOffset: number) {
  // console.log(documentMap, getRoot(cst), documentMap.get(getRoot(cst)));
  const inputNode = findLeafNodeAtStrictOffset(cst, triggerOffset);
  let node = inputNode,
    isWSCursor = false;
  if (node) {
    isWSCursor = isWhiteSpaceNode(node, triggerOffset);
    if (isWSCursor) {
      const nextNode = findNextTokenNode(node);
      if (nextNode.offset >= inputNode.end && isMarkedMismatchTokenNode(nextNode)) {
        return { isWSCursor, inputNode, node: nextNode, isMismatchToken: true };
      }
    }
    if (isMarkedMismatchTokenNode(node) || node.hidden || isWSCursor) {
      // console.time("prevCstStack");
      for (node of searchPrevTokenNode(inputNode)) {
        if (
          !isMarkedMismatchTokenNode(node) &&
          !node.hidden &&
          !isWhiteSpaceNode(node, triggerOffset)
        ) {
          break;
        }
      }
      // console.timeEnd("prevCstStack");
      // console.log(node);
    }
  }
  return { isWSCursor, node, inputNode };
}

export function findIdentifierNode(
  cst: langium.CstNode,
  offset: number
): {
  node?: langium.CstNode | undefined;
  inputNode: langium.CstNode;
  isMismatchToken?: boolean;
} {
  const inputNode = findLeafNodeAtStrictOffset(cst, offset);
  let node = inputNode;
  if (isWhiteSpaceNode(node, offset)) {
    const nextNode = findNextTokenNode(node);
    if (nextNode.offset >= inputNode.end && isMarkedMismatchTokenNode(nextNode)) {
      return { inputNode, node: nextNode, isMismatchToken: true };
    }
  }
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
      if (checkLeafNodeTokenType(node, ast.ID)) {
        return { node, inputNode };
      }
    }
    prev = node;
  }
  return { node, inputNode };
}

// export function findWordNodeAtOffset(
//   node: langium.CstNode,
//   offset: number
// ): langium.CstNode | undefined {
//   if (isLeafCstNode(node)) {
//     return node;
//   } else if (isCompositeCstNode(node)) {
//     if (langium.isCrossReference(node.feature)) {
//       const children = node.children.filter((e) => e.offset <= offset).reverse();
//       for (const child of children) {
//         const result = findWordNodeAtOffset(child, offset);
//         if (result) {
//           return node; //.parent.children[node.parent.children.indexOf(node) - 1] as CstNode;
//         }
//       }
//       // return node
//     } else if (
//       node.children.length > 1 &&
//       langium.isRuleCall(node.feature) &&
//       langium.isParserRule(node.feature.rule.ref) &&
//       node.feature.rule.ref.type === "string"
//     ) {
//       const children = node.children.filter((e) => e.offset <= offset).reverse();
//       for (const child of children) {
//         const result = findWordNodeAtOffset(child, offset);
//         if (result) {
//           return node; //.parent.children[node.parent.children.indexOf(node) - 1] as CstNode;
//         }
//       }
//       // return node
//     }
//     const children = node.children.filter((e) => e.offset <= offset).reverse();
//     for (const child of children) {
//       const result = findWordNodeAtOffset(child, offset);
//       if (result) {
//         return result;
//       }
//     }
//   }
//   return undefined;
// }

export function* searchWordNodeWithOffset(
  node: langium.CstNode,
  offset: number
): Generator<{ node: LeafCstNodeImpl | langium.CompositeCstNode; isMismatchToken?: true }> {
  if (isLeafCstNode(node) && node.offset <= offset && node.end >= offset) {
    yield { node };
  } else if (isCompositeCstNode(node) && node.offset <= offset) {
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
  let com = node as langium.CompositeCstNode;
  while (com.children.length <= 1) {
    if (!com.parent) return com;
    com = com.parent;
  }
  return com;
}

export function findPrevTokenNode(
  node: langium.CstNode,
  allowError?: boolean
): langium.CstNode | undefined {
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
    } while (!allowError && match && match.offset !== match.offset);
    current = parent;
  } while (current?.parent && !match);
  if (match instanceof CompositeCstNodeImpl) {
    let current: langium.CstNode;
    for (const child of findLastCstGen(match)) {
      if (child === node) {
        break;
      }
      if (allowError || child.offset === child.offset) {
        current = child;
        break;
      }
    }
    return current; //findLastValidNode(match);
  }
  return match;
}
export function* searchPrevTokenNode(
  node: langium.CstNode,
  allowError?: boolean
): Generator<langium.CstNode> {
  // console.log("findLeafNodeAtOffset", node);
  let e = node;
  while (e) {
    e = findPrevTokenNode(e);
    if (e) {
      yield e;
    }
  }
}

export function findNextTokenNode(
  node: langium.CstNode,
  allowError?: boolean
): langium.CstNode | undefined {
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
      const next = currentIndex + ++index;
      match = parent.children[next];
    } while (!allowError && match && match.offset !== match.offset);
    current = parent;
  } while (current?.parent && !match);
  if (match instanceof CompositeCstNodeImpl) {
    let current: langium.CstNode;
    for (const child of findCstGen(match)) {
      if (allowError || child.offset === child.offset) {
        current = child;
        break;
      }
    }
    return current; //findLastValidNode(match);
  }
  return match;
}
export function* searchNextTokenNode(
  node: langium.CstNode,
  allowError?: boolean
): Generator<langium.CstNode> {
  // console.log("findLeafNodeAtOffset", node);
  let e = node;
  while (e) {
    e = findNextTokenNode(e, allowError);
    if (e) {
      yield e;
    }
  }
}

/**
 * 严格查找叶子节点
 * @param node -
 * @param offset -
 */
export function findLeafNodeAtStrictOffset(node: langium.CstNode, offset: number) {
  const result = langium.findLeafNodeAtOffset(node, offset);
  if (result.end < offset) {
    for (node of searchNextTokenNode(result, true)) {
      // 忽略隐藏节点的判断，因隐藏节点的顺序可能发生错乱
      if (!node.hidden && node.end < offset) {
        break;
        // 捕获在offset处end的节点
      } else if (
        (node.end >= offset && node.offset < offset) ||
        (node.offset <= offset && node.end > offset)
      ) {
        return node;
      }
    }
  } else {
    for (node of searchPrevTokenNode(result, true)) {
      // 忽略隐藏节点的判断，因隐藏节点的顺序可能发生错乱
      if (!node.hidden && node.end < offset) {
        break;
        // 捕获在offset处end的节点
      } else if (
        (node.end === offset && node.offset < offset) ||
        (node.offset === offset && node.end > offset)
      ) {
        return node;
      }
    }
  }
  return result;
}
/**
 * 严格查找叶子节点
 * @param node -
 * @param offset -
 */
export function filterTokenNodeRange(node: langium.CstNode, offset: number, end: number) {
  return [...searchTokenNodeRange(node, offset, end)];
}
/**
 * 严格查找叶子节点
 * @param node -
 * @param offset -
 */
export function* searchTokenNodeRange(node: langium.CstNode, offset: number, end: number) {
  const result = findLeafNodeAtStrictOffset(node, offset);
  for (node of searchNextTokenNode(result, true)) {
    yield node;
    if (node.offset < end && node.end >= end) {
      break;
    }
  }
}

export function testSearchNextTokenNode(node: langium.CstNode, allowError = false) {
  for (node of searchNextTokenNode(node, allowError)) {
    console.log(node);
  }
}
export function testSearchPrevTokenNode(node: langium.CstNode) {
  for (node of searchPrevTokenNode(node)) {
    console.log(node);
  }
}

// globalThis.testSearchNextTokenNode = testSearchNextTokenNode;
// globalThis.testSearchPrevTokenNode = testSearchPrevTokenNode;
// globalThis.flattenCstGen = flattenCstGen;

export const SpaceMap = toConstMap([ast.WS, ast.Indent, ast.Outdent, ast.CommonIndent]);
export const WhiteSpaceMap = {
  ...toConstMap([ast.EOL]),
  ...SpaceMap
};

export function isWhiteSpaceNode(node: langium.CstNode, offset?: number) {
  if (isLeafCstNode(node)) {
    if (isWhiteSpaceEOLNode(node, offset)) {
      return true;
    }
    if (isWhiteSpaceToken(node)) {
      return true;
    }
  }
  return isWhiteSpaceFeature(node.feature);
}

export function isWhiteSpaceEOLNode(node: langium.CstNode, offset?: number) {
  if (checkNodeTypeName(node, ast.EOL) && node.end > offset) {
    return offset
      ? /^ +$/.test(node.text.substring(0, node.end - offset - 1))
      : /^ +/.test(node.text);
  }
}
export function isEOLNode(node: langium.CstNode) {
  return checkNodeTypeName(node, ast.EOL);
}
export function isWhiteSpaceFeature(node: langium.AbstractElement | langium.AbstractRule) {
  return node && checkName("name" in node ? node.name : getRuleCallName(node), SpaceMap);
}

export function isWhiteSpaceToken(node: langium.LeafCstNode) {
  return checkNodeTypeName(node, SpaceMap);
}

export function checkNodeTypeName(
  target: langium.CstNode,
  name?: string | Record<string, true> | RegExp
) {
  return checkName(getNodeTypeName(target), name);
}

export function getNodeTypeName(target: langium.CstNode) {
  return (
    (target &&
      (getRuleCallName(target.feature) ||
        getKeywordName(target.feature) ||
        getRuleCallName((target as langium.LeafCstNode).tokenType) ||
        getCrossReferencedName(target.feature) ||
        (isLeafCstNode(target) && getTokenTypeName(target.tokenType)))) ||
    void 0
  );
}
export function isRuleCallType(
  target: langium.AbstractElement,
  name?: string | Record<string, true>
): target is langium.RuleCall {
  return checkName(getRuleCallName(target), name);
}

export function getRuleCallName(target: unknown) {
  return (
    getFeatureRuleName(target) ||
    ((langium.isRuleCall(target) || langium.isTerminalRuleCall(target)) && target.rule.$refText) ||
    void 0
  );
}
export function getKeywordName(target: unknown) {
  return langium.isKeyword(target) && (getFeatureRuleName(target) || target.value);
}
function getFeatureRuleName(target: unknown) {
  return (
    langium.isAstNode(target) &&
    ((langium.isParserRule(target.$container) && target.$container.name) ||
      (langium.isAction(target.$container) && target.$container.type))
  );
}

export function getCrossReferencedName(target: unknown) {
  return (langium.isCrossReference(target) && "$" + target.type.$refText) || void 0;
}

export function getTokenTypeName(target: unknown) {
  return (target as TokenType)?.name;
}

export function isTokenType(target: TokenType, name?: string | Record<string, true>) {
  return checkName(target?.name, name);
}

export function checkName(name: string, target?: string | Record<string, true> | RegExp) {
  return !!(
    name &&
    (!target ||
      (typeof target === "string"
        ? name === target
        : target instanceof RegExp
        ? target.test(name)
        : target[name]))
  );
}

import { IterationNode, Node } from "ohm-js";
import {
  createIgnoreNode,
  defineActions,
  getSourceCtor,
  InternalNodeData,
  InternalNodeKind,
  isSourceNodeData,
  NodeTypeKind,
} from "../interface";
import { toSource } from "./_util";

export function stringify(node: Node) {
  let data = node.parse() as any[];
  if (data instanceof Array && (data = data.flat()).length === 1 && isSourceNodeData(data[0])) {
    return data[0].value ?? "";
  }
  return data ?? "";
}
function iter(
  children: (IterationNode | InternalNodeData | undefined)[],
  deep: number = 0,
  parent?: any
): {
  hasObject: boolean;
  result?: (string | InternalNodeData)[];
} {
  const ret = [];
  let hasObject = false;
  const source = [];
  let sourceI = -1,
    retI = -1,
    ctorName: string,
    childrenCtorName: string = "";
  // console.log(children)
  for (const child of children) {
    let value =
      (child && (isSourceNodeData(child) ? child : (child as IterationNode).parse())) || child;
    source[++sourceI] = value;
    if (isSourceNodeData(value)) {
      !ctorName && (ctorName = value.sourceType);
      value = value.value;
    } else if (value instanceof Array) {
      const { result, hasObject: childHasObject } = iter(value, deep + 1, child);
      if (result) {
        let resultCtorName: string;
        for (let i = 0; i < result.length; i++) {
          const resItem = result[i];
          if (isSourceNodeData(resItem)) {
            !resultCtorName && (ctorName = resItem.sourceType);
            ret[++retI] = resItem.value;
            continue;
          }
          ret[++retI] = resItem;
        }
        resultCtorName && (childrenCtorName = resultCtorName);
      }
      !hasObject && (hasObject = childHasObject);
      continue;
    } else {
      !hasObject && (hasObject = typeof value === "object");
      !ctorName && (ctorName = getSourceCtor(child));
    }
    value && (ret[++retI] = value);
  }
  let result: (string | InternalNodeData)[];
  if (hasObject) {
    result = ret;
  } else if (ret.length > 0) {
    const value = ret.length === 1 ? ret[0] : ret.join("");
    const str = isSourceNodeData(value) ? value.value : value;
    result = [
      {
        type: NodeTypeKind.Source,
        kind: InternalNodeKind.Content,
        value: str,
        sourceType: (ctorName || "") + (childrenCtorName ? `(${childrenCtorName})` : "") || void 0,
      },
    ];
  }
  // if (deep > 0) {
  //   debugger;
  // }
  // if (result) {
  //   console.log(
  //     `iter[${deep}]`,
  //     ctorName,
  //     "parent:",
  //     parent?.ctorName || parent || children.length > 0 ? ctorName : ctorName + "(empty)",
  //     "source",
  //     children,
  //     source,
  //     "=>",
  //     "result:",
  //     result,
  //     "hasObject:",
  //     hasObject
  //   );
  // }
  return {
    hasObject,
    result,
  };
}
function optional(node: Node) {
  // const data = node.parse()
  // if (data instanceof Array && data.length === 1) {
  //   return data[0]
  // }
  // return data || void 0
  const iters = node.parse();
  if (iters instanceof Array && iters.length > 1) {
    throw Error();
  }
  const data = iters?.[0];
  return isSourceNodeData(data) ? data.value : data || void 0;
}

export const Base = defineActions({
  NonemptyListOf(a, b, c) {
    const c2 = c.parse();
    if (c2 instanceof Array) {
      return [a.parse(), ...c2.flat(1)];
    }
    return [a.parse()];
  },
  nonemptyListOf(a, b, c) {
    const c2 = c.parse();
    if (c2 instanceof Array) {
      return [a.parse(), ...c2.flat(1)];
    }
    return [a.parse()];
  },
  EmptyListOf() {
    return [];
  },
  emptyListOf() {
    return [];
  },
  oresc(_, { sourceString }) {
    const escChar = _.parse();
    if (escChar) {
      switch (sourceString) {
        case "n":
          return "\n";
        case "r":
          return "\r";
        case "t":
          return "\t";
        case "\\":
          return "\\";
      }
    }
    return sourceString;
  },
  // strictEscapable_escaped(_, { sourceString }) {
  //   // console.log(sourceString);
  //   switch (sourceString) {
  //     case "n":
  //       return "\n";
  //     case "r":
  //       return "\r";
  //     case "t":
  //       return "\t";
  //     case "\\":
  //       return "\\";
  //     default:
  //       return sourceString; // eval(`"\\${sourceString}"`);
  //   }
  // },
  // contentOf_paren(left, content, right) {
  //   return {
  //     left: left.parse(),
  //     content: content.parse(),
  //     right: right.parse(),
  //     source: toSource(...arguments)
  //   }
  // },
  // contentOf_escaped(content) {
  //   return {
  //     content: content.parse(),
  //     source: toSource(...arguments)
  //   }
  // },
  // contentOf_self(content) {
  //   return {
  //     content: content.parse(),
  //     source: toSource(...arguments)
  //   }
  // },
  // contentOf(_l, _s1, content, _s2, _r) {
  //   return content.parse();
  // },
  centerOf(L, C, R) {
    return C.parse();
  },
  sourceOf(o) {
    return o.sourceString;
  },
  stringify,
  join(p, content) {
    return stringify(p) + stringify(content); //.parse()
  },
  startWith(prefix, content) {
    return content.parse();
  },
  endWith(content, suffix) {
    return content.parse();
  },
  ignore(T) {
    return createIgnoreNode(toSource(T));
  },
  optional,
  _iter(...children) {
    // console.log("_iter", iter(children).result);
    return iter(children, 0).result;
    // const ret = [];
    // let hasObject = false;
    // for (const child of children as any) {
    //   const value = child.parse();
    //   hasObject = hasObject || typeof value === "object";
    //   ret.push(value);
    // }
    // return hasObject ? ret : ret.join("");
  },
  _terminal() {
    return this.sourceString;
  },
});

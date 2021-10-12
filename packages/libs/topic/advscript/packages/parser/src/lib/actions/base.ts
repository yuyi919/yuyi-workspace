import { Semantics } from "ohm-js";
import { defineActions, Node } from "../interface";
import { ExpressionNodeData } from "./Expression";

function parseSignedHexNumber(str: string) {
  const char = str[0];
  if (char === "-") {
    return -Number(str.substr(1));
  } else {
    return Number(str.substr(1));
  }
}

export interface ValueNodeData<T = any> {
  type: "value";
  value?: T;
}
export interface ArraySpreadExpressionData {
  type: "ArraySpread";
  start?: ValueNodeData<number>;
  end?: ValueNodeData<number>;
}
export interface ArrayExpressionData {
  type: "array";
  value?: ExpressionNodeData[];
}
export type ArrayNodeData = ArrayExpressionData | ArraySpreadExpressionData;

export interface ValueNode<T = any> extends Node<ValueNodeData<T>> {}

export const Base = defineActions({
  value(n): ValueNodeData {
    let value: string | number | boolean;
    switch (n.ctorName) {
      case "string":
        value = n.parse();
        break;
      case "number":
        value = Number(n.parse()) || parseSignedHexNumber(n.parse());
        break;
      case "boolean":
        value = n.parse().toLowerCase() === "true";
        break;
      case "array":
        return n.parse();
      default:
        value = null;
    }
    return {
      type: "value",
      value: value,
    };
  },
  number_sign(sign, number) {
    return sign.parse() + number.parse();
  },
  number_fract(number, dot, decimal) {
    return number.parse() + "." + decimal.parse();
  },
  number_hex(head, octdigit) {
    return "0x" + octdigit.parse();
  },
  Expression(node) {
    return node.parse();
  },
  ArrayItems(list): ArrayNodeData {
    return {
      type: "array",
      value: list.parse(),
    };
  },
  ArraySpread(start, list, end): ArrayNodeData {
    return {
      type: "ArraySpread",
      start: start.parse(),
      end: end.parse(),
    };
  },
  Array(head, list, foot): ArrayNodeData {
    return list.parse();
  },
  NonemptyListOf(a, b, c) {
    return [a.parse(), ...c.parse()];
  },
  EmptyListOf() {
    return [];
  },
  string_doubleQuote(quoteA, stringContent, quoteB) {
    return stringContent.parse();
  },
  string_singleQuote(quoteA, stringContent, quoteB) {
    return stringContent.parse();
  },
  _iter(...children) {
    const ret = [];
    let hasObject = false;
    for (const child of children as any) {
      const value = child.parse();
      hasObject = hasObject || typeof value === "object";
      ret.push(value);
    }
    return hasObject ? ret : ret.join("");
  },
  _terminal() {
    return this.sourceString;
  },
});

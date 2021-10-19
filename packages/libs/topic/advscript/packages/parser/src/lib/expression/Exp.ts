import {
  ArrayNodeData,
  BinaryExpressionNodeData,
  defineActions,
  Node,
  NodeTypeKind,
  OperatorNode,
  ValueNodeData,
  IdentifierData,
} from "../interface";
import { ExpressionNode } from "./Expression";

function parseSignedHexNumber(str: string) {
  const char = str[0];
  if (char === "-") {
    return -Number(str.substr(1));
  } else {
    return Number(str.substr(1));
  }
}

export interface ValueNode<T = any> extends Node<ValueNodeData<T>> {}

export type VariablePrefixKeyword = "$" | "%";
export interface VariableNode extends Node<IdentifierData> {}

function mathExp(
  left: ExpressionNode,
  operator: OperatorNode,
  right: ExpressionNode
): BinaryExpressionNodeData {
  return {
    type: NodeTypeKind.Expression,
    value: {
      left: left.parse(),
      operator: operator.parse(),
      right: right.parse(),
    },
  };
}

export const Exp = defineActions({
  identifier(prefix: Node<VariablePrefixKeyword>, n: Node<string>): IdentifierData {
    return {
      type: NodeTypeKind.Identifier,
      prefix: prefix.parse() || null,
      value: n.parse(),
    };
  },
  literal(n): ValueNodeData {
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
      case "percet":
        return n.parse();
      default:
        value = null;
    }
    return {
      type: NodeTypeKind.Raw,
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
  percet(head, suffix) {
    return {
      type: "percet",
      value: parseFloat(head.parse()),
    };
  },
  ArrayItems(list): ArrayNodeData {
    return {
      type: NodeTypeKind.Array,
      value: list.parse(),
    };
  },
  ArraySpread(start, list, end): ArrayNodeData {
    return {
      type: NodeTypeKind.ArraySpread,
      start: start.parse(),
      end: end.parse(),
    };
  },
  Array(head, list, foot): ArrayNodeData {
    return list.parse();
  },
  string_doubleQuote(quoteA, stringContent, quoteB) {
    return stringContent.parse();
  },
  string_singleQuote(quoteA, stringContent, quoteB) {
    return stringContent.parse();
  },
  AddExp_add: mathExp,
  MulExp_mul: mathExp,
  ExpExp_power: mathExp,
  PriExp_paren(head, MathExp, foot) {
    return MathExp.parse();
  },
  PriExp_neg(neg, PriExp: ExpressionNode): BinaryExpressionNodeData {
    return {
      type: NodeTypeKind.Expression,
      value: {
        left: {
          type: NodeTypeKind.Raw,
          value: 0,
        },
        operator: "-",
        right: PriExp.parse(),
      },
    };
  },
  PriExp_pos(pos, PriExp: ExpressionNode): BinaryExpressionNodeData {
    return {
      type: NodeTypeKind.Expression,
      value: {
        left: {
          type: NodeTypeKind.Raw,
          value: 0,
        },
        operator: "+",
        right: PriExp.parse(),
      },
    };
  },
});

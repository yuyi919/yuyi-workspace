// import { Arithmetic, Variable } from "./arithmetic";
// import { Base } from "./base";
// import { Comment } from "./Comment";
// import { Exp } from "./Exp";
// import { Expression } from "./Expression";
// import { Keyvalue } from "./keyvalue";
import {
  ForeachStatmentData,
  IfStatmentData,
  LetStatmentData,
  WhileStatmentData,
} from "./LogicBlock";

export type StatementData =
  | ForeachStatmentData
  | IfStatmentData
  | LetStatmentData
  | WhileStatmentData;
export * from "./base";
export * from "./story";
export * from "./LogicBlock";
export * from "./Expression";
export * from "./Comment";

export interface ParsedData {
  type: string;
  value?: any;
}

export interface LabelNode extends Node {
  parse(): string;
}

export type OperatorKeyword =
  | "&&"
  | "||"
  | "??"
  | "=="
  | "!="
  | ">="
  | "<="
  | ">"
  | "<"
  | "+"
  | "-"
  | "*"
  | "/"
  | "^"
  | "%";

import { Node } from "ohm-js";
import { AVSActionDict } from "@adv.ohm-bundle";
export interface LabelNode extends Node {
  parse(): string;
}

export interface OperatorNode extends Node {
  parse(): OperatorKeyword;
}
export interface ParsedData {
  type: string;
  value?: any;
}
export function defineActions<T>(actions: AVSActionDict<T>): AVSActionDict<T> {
  return actions;
}

export type { Node };

export enum NodeTypeKind {
  Comment = "Comment",
  Raw = "value",
  Array = "array",
  ArraySpread = "ArraySpread",
  Identifier = "identifier",
  Statment = "statment",
  Expression = "expression",
  CallExpression = "CallExpression",
}

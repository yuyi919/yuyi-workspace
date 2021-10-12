import { Arithmetic, Variable } from "./arithmetic";
import { Base } from "./base";
import { Comment } from "./Comment";
import { Exp } from "./Exp";
import { Expression } from "./Expression";
import { Keyvalue } from "./keyvalue";
import {
  ForeachStatment,
  IfStatement,
  LetStatment,
  LogicBlock,
  WhileStatement,
} from "./LogicBlock";
import { Story } from "./story";

export const Actions2 = {
  Base,
  Variable,
  Arithmetic,
  Keyvalue,
  Story,
  Expression,
  Comment,
  LogicBlock,
  Exp,
};
export const Actions = {
  ...Base,
  ...Variable,
  ...Arithmetic,
  ...Keyvalue,
  ...Story,
  ...Expression,
  ...Comment,
  ...LogicBlock,
  ...Exp,
};

export type Statement = LetStatment | IfStatement | ForeachStatment | WhileStatement;
export type StatementData = ReturnType<Statement["parse"]>;

import { Base } from "./base";
import { Comment } from "./Comment";
import { Exp } from "../expression/Exp";
import {
  ForeachStatment,
  IfStatement,
  LetStatment,
  LogicBlock,
  WhileStatement,
} from "./LogicBlock";
import { Story } from "./story";

export const Actions = {
  ...Base,
  ...Story,
  ...Comment,
  ...LogicBlock,
  variableName: Exp.variableName,
  // ...Exp,
};

export type Statement = LetStatment | IfStatement | ForeachStatment | WhileStatement;
export type StatementData = ReturnType<Statement["parse"]>;

import { ILexingError, IRecognitionException, TokenType } from "chevrotain";
import { LangiumServices, AstNode, LangiumDocument, AbstractElement, Action } from "./factory";
export type ParseResult<T = AstNode> = {
  value: T;
  parserErrors: IRecognitionException[];
  lexerErrors: ILexingError[];
};
export type RuleResult = () => any;
export abstract class AbstractLangiumParser {
  constructor(services: LangiumServices) {}
  abstract parse<T extends AstNode = AstNode>(input: string | LangiumDocument<T>): ParseResult<T>;
}

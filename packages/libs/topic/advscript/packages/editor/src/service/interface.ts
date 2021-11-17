import { ILexingError, IRecognitionException } from "chevrotain";
import { AstNode, LangiumDocument, LangiumServices } from "langium";
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

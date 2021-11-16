import { ILexingError, IRecognitionException, TokenType } from "chevrotain";
import { LangiumDocument } from "../documents/document";
import { AbstractElement, Action } from "../grammar/generated/ast";
import { AstNode } from "../syntax-tree";
import { LangiumServices } from "../services";
export type ParseResult<T = AstNode> = {
  value: T;
  parserErrors: IRecognitionException[];
  lexerErrors: ILexingError[];
};
export type RuleResult = () => any;
export abstract class AbstractLangiumParser {
  constructor(services: LangiumServices, tokens: TokenType[]) {}
  abstract MAIN_RULE(
    name: string,
    type: string | symbol | undefined,
    implementation: () => unknown
  ): () => unknown;
  abstract parse<T extends AstNode = AstNode>(input: string | LangiumDocument<T>): ParseResult<T>;
  abstract alternatives(idx: number, choices: Array<() => void>): void;
  abstract optional(idx: number, callback: () => void): void;
  abstract many(idx: number, callback: () => void): void;
  abstract atLeastOne(idx: number, callback: () => void): void;
  abstract consume(idx: number, tokenType: TokenType, feature: AbstractElement): void;
  abstract unassignedSubrule(idx: number, rule: RuleResult, feature: AbstractElement): void;
  abstract subrule(idx: number, rule: RuleResult, feature: AbstractElement): any;
  abstract action($type: string, action: Action): void;
  /**
   * Initializes array fields of the current object. Array fields are not allowed to be undefined.
   * Therefore, all array fields are initialized with an empty array.
   * @param initialArrayProperties The grammar access element that belongs to the current rule
   */
  abstract initializeElement(initialArrayProperties: string[]): void;
  abstract construct(pop?: boolean): unknown;
  abstract finalize(): void;
}

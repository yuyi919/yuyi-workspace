/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/naming-convention */
import {
  defaultParserErrorProvider,
  DSLMethodOpts,
  EmbeddedActionsParser,
  ILexingError,
  IMultiModeLexerDefinition,
  IOrAlt,
  IParserErrorMessageProvider,
  IRecognitionException,
  IToken,
  Lexer,
  TokenType,
  TokenTypeDictionary,
  TokenVocabulary
} from "chevrotain";
import {
  AbstractElement,
  Action,
  Assignment,
  AstNode,
  CompositeCstNode,
  CstNode,
  DatatypeSymbol,
  getContainerOfType,
  IParserConfig,
  isAssignment,
  isCrossReference,
  isKeyword,
  LangiumServices,
  LeafCstNode,
  linkContentToContainer,
  tokenToRange
} from "langium";
import {
  CompositeCstNodeImpl,
  CstNodeBuilder,
  LeafCstNodeImpl,
  RootCstNodeImpl
} from "langium/lib/parser/cst-node-builder";
import { ValueConverter } from "langium/lib/parser/value-converter";
import { Linker } from "langium/lib/references/linker";

export type ParseResult<T = AstNode> = {
  value: T;
  parserErrors: IRecognitionException[];
  lexerErrors: ILexingError[];
};

interface DataTypeNode {
  $cstNode: CompositeCstNode;
  /** Instead of a string, this node is uniquely identified by the `Datatype` symbol */
  $type: symbol;
  /** Used as a storage for all parsed terminals, keywords and sub-datatype rules */
  value: string;
}

function isDataTypeNode(node: { $type: string | symbol | undefined }): node is DataTypeNode {
  return node.$type === DatatypeSymbol;
}

type RuleResult = () => any;

type Args = Record<string, boolean>;

type RuleImpl = (args: Args) => any;

type Alternatives = Array<IOrAlt<any>>;

interface AssignmentElement {
  assignment?: Assignment;
  crossRef: boolean;
}

export class LangiumParser {
  private readonly linker: Linker;
  private readonly converter: ValueConverter;
  private readonly lexer: Lexer;
  private readonly nodeBuilder = new CstNodeBuilder();
  private readonly wrapper: ChevrotainWrapper;
  private stack: any[] = [];
  private mainRule!: RuleResult;
  private assignmentMap = new Map<AbstractElement, AssignmentElement | undefined>();

  private get current(): any {
    return this.stack[this.stack.length - 1];
  }
  readonly _wrapper: ChevrotainWrapper;
  readonly _lexer: Lexer;

  constructor(
    services: LangiumServices,
    tokens: TokenVocabulary,
    tokenMap?: Record<string, TokenType>
  ) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    this.linker = services.references.Linker;
    this.converter = services.parser.ValueConverter;
    this.lexer = new Lexer(isTokenTypeDictionary(tokens) ? Object.values(tokens) : tokens, {
      skipValidations: true
    });
    this.wrapper = new ChevrotainWrapper(tokenMap, services.parser.ParserConfig);
    // console.log(this.wrapper, services.parser.ParserConfig)
    this._wrapper = this.wrapper;
    this._lexer = this.lexer;
  }

  MAIN_RULE(name: string, type: string | symbol | undefined, implementation: RuleImpl): RuleResult {
    return (this.mainRule = this.DEFINE_RULE(name, type, implementation));
  }

  DEFINE_RULE(
    name: string,
    type: string | symbol | undefined,
    implementation: RuleImpl
  ): RuleResult {
    return this.wrapper.DEFINE_RULE(
      name,
      this.startImplementation(type, implementation).bind(this)
    );
  }

  parse<T extends AstNode = AstNode>(input: string): ParseResult<T> {
    this.nodeBuilder.buildRootNode(input);
    const lexerResult = this.lexer.tokenize(input);
    this.wrapper.input = lexerResult.tokens;
    const result = this.mainRule.call(this.wrapper);
    this.addHiddenTokens(result.$cstNode, lexerResult.groups.hidden);
    return {
      value: result,
      lexerErrors: lexerResult.errors,
      parserErrors: this.wrapper.errors
    };
  }

  private addHiddenTokens(node: RootCstNodeImpl, tokens?: IToken[]): void {
    if (tokens) {
      for (const token of tokens) {
        const hiddenNode = new LeafCstNodeImpl(
          token.startOffset,
          token.image.length,
          tokenToRange(token),
          token.tokenType,
          true
        );
        hiddenNode.root = node;
        this.addHiddenToken(node, hiddenNode);
      }
    }
  }

  private addHiddenToken(node: CompositeCstNode, token: LeafCstNode): void {
    const { offset, end } = node;
    const { offset: tokenStart, end: tokenEnd } = token;
    if (offset >= tokenEnd) {
      node.children.unshift(token);
    } else if (end <= tokenStart) {
      node.children.push(token);
    } else {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const childEnd = child.end;
        if (child instanceof CompositeCstNodeImpl && tokenEnd < childEnd) {
          this.addHiddenToken(child, token);
          return;
        } else if (tokenEnd <= child.offset) {
          node.children.splice(i, 0, token);
          return;
        }
      }
    }
  }

  private startImplementation(
    $type: string | symbol | undefined,
    implementation: RuleImpl
  ): RuleImpl {
    return (args) => {
      if (!this.wrapper.IS_RECORDING) {
        const node: any = { $type };
        this.stack.push(node);
        if ($type === DatatypeSymbol) {
          node.value = "";
        }
      }
      let result: unknown;
      try {
        result = implementation(args);
      } catch (err) {
        result = undefined;
      }
      if (!this.wrapper.IS_RECORDING && result === undefined) {
        result = this.construct();
      }
      return result;
    };
  }

  alternatives(idx: number, choices: Alternatives): void {
    this.wrapper.wrapOr(idx, choices);
  }

  optional(idx: number, callback: DSLMethodOpts<unknown>): void {
    this.wrapper.wrapOption(idx, callback);
  }

  many(idx: number, callback: DSLMethodOpts<unknown>): void {
    this.wrapper.wrapMany(idx, callback);
  }

  atLeastOne(idx: number, callback: DSLMethodOpts<unknown>): void {
    this.wrapper.wrapAtLeastOne(idx, callback);
  }

  consume(idx: number, tokenType: TokenType, feature: AbstractElement): void {
    const token = this.wrapper.wrapConsume(idx, tokenType);
    if (!this.wrapper.IS_RECORDING) {
      const leafNode = this.nodeBuilder.buildLeafNode(token, feature);
      const { assignment, crossRef } = this.getAssignment(feature);
      const current = this.current;
      if (assignment) {
        let crossRefId: string | undefined;
        if (crossRef) {
          crossRefId = `${current.$type}:${assignment.feature}`;
        }
        const convertedValue = isKeyword(feature)
          ? token.image
          : this.converter.convert(token.image, leafNode);
        this.assign(assignment.operator, assignment.feature, convertedValue, leafNode, crossRefId);
      } else if (isDataTypeNode(current)) {
        let text = token.image;
        if (!isKeyword(feature)) {
          text = this.converter.convert(text, leafNode).toString();
        }
        current.value += text;
      }
    }
  }

  unassignedSubrule(idx: number, rule: RuleResult, feature: AbstractElement, args: Args): void {
    const result = this.subrule(idx, rule, feature, args);
    if (!this.wrapper.IS_RECORDING) {
      const current = this.current;
      if (isDataTypeNode(current)) {
        current.value += result.toString();
      } else {
        const resultKind = result.$type;
        const object = this.assignWithoutOverride(result, current);
        if (resultKind) {
          object.$type = resultKind;
        }
        const newItem = object;
        this.stack.pop();
        this.stack.push(newItem);
      }
    }
  }

  subrule(idx: number, rule: RuleResult, feature: AbstractElement, args: Args): any {
    let cstNode: CompositeCstNode | undefined;
    if (!this.wrapper.IS_RECORDING) {
      cstNode = this.nodeBuilder.buildCompositeNode(feature);
    }
    const subruleResult = this.wrapper.wrapSubrule(idx, rule, args);
    if (!this.wrapper.IS_RECORDING) {
      const { assignment, crossRef } = this.getAssignment(feature);
      if (assignment && cstNode) {
        let crossRefId: string | undefined;
        if (crossRef) {
          crossRefId = `${this.current.$type}:${assignment.feature}`;
        }
        this.assign(assignment.operator, assignment.feature, subruleResult, cstNode, crossRefId);
      }
    }
    return subruleResult;
  }

  action($type: string, action: Action): void {
    if (!this.wrapper.IS_RECORDING) {
      let last = this.current;
      // This branch is used for left recursive grammar rules.
      // Those don't call `construct` before another action.
      // Therefore, we need to call it here.
      if (!last.$cstNode && action.feature && action.operator) {
        last = this.construct(false);
        const feature = last.$cstNode.feature;
        this.nodeBuilder.buildCompositeNode(feature);
      }
      const newItem = { $type };
      this.stack.pop();
      this.stack.push(newItem);
      if (action.feature && action.operator) {
        this.assign(action.operator, action.feature, last, last.$cstNode);
      }
    }
  }

  /**
   * Initializes array fields of the current object. Array fields are not allowed to be undefined.
   * Therefore, all array fields are initialized with an empty array.
   * @param initialArrayProperties The grammar access element that belongs to the current rule
   */
  initializeElement(initialArrayProperties: string[]): void {
    if (!this.wrapper.IS_RECORDING) {
      const item = this.current;
      for (const element of initialArrayProperties) {
        item[element] = [];
      }
    }
  }

  construct(pop = true): unknown {
    if (this.wrapper.IS_RECORDING) {
      return undefined;
    }
    const obj = this.current;
    linkContentToContainer(obj);
    this.nodeBuilder.construct(obj);
    if (pop) {
      this.stack.pop();
    }
    if (isDataTypeNode(obj)) {
      return this.converter.convert(obj.value, obj.$cstNode);
    }
    return obj;
  }

  private getAssignment(feature: AbstractElement): AssignmentElement {
    if (!this.assignmentMap.has(feature)) {
      const assignment = getContainerOfType(feature, isAssignment);
      this.assignmentMap.set(feature, {
        assignment: assignment,
        crossRef: assignment ? isCrossReference(assignment.terminal) : false
      });
    }
    return this.assignmentMap.get(feature)!;
  }

  private assign(
    operator: string,
    feature: string,
    value: unknown,
    cstNode: CstNode,
    crossRefId?: string
  ): void {
    const obj = this.current;
    let item: unknown;
    if (crossRefId && typeof value === "string") {
      item = this.linker.buildReference(obj, cstNode, crossRefId, value);
    } else {
      item = value;
    }
    switch (operator) {
      case "=": {
        obj[feature] = item;
        break;
      }
      case "?=": {
        obj[feature] = true;
        break;
      }
      case "+=": {
        if (!Array.isArray(obj[feature])) {
          obj[feature] = [];
        }
        obj[feature].push(item);
      }
    }
  }

  private assignWithoutOverride(target: any, source: any): any {
    for (const [name, value] of Object.entries(source)) {
      if (target[name] === undefined) {
        target[name] = value;
      }
    }
    return target;
  }

  finalize(): void {
    this.wrapper.wrapSelfAnalysis();
  }

  get definitionErrors(): IParserDefinitionError[] {
    return this.wrapper.definitionErrors;
  }
}

export interface IParserDefinitionError {
  message: string;
  type: number;
  ruleName?: string;
}

export class LangiumParserErrorMessageProvider implements IParserErrorMessageProvider {
  buildMismatchTokenMessage({
    expected,
    actual,
    previous,
    ruleName
  }: {
    expected: TokenType;
    actual: IToken;
    previous: IToken;
    ruleName: string;
  }): string {
    const expectedMsg = expected.LABEL
      ? "`" + expected.LABEL + "`"
      : expected.name.endsWith(":KW")
      ? `keyword '${expected.name.substring(0, expected.name.length - 3)}'`
      : `token of type '${expected.name}'`;
    // console.error({
    //   expected,
    //   actual,
    //   previous,
    //   ruleName
    // });
    return `Expecting ${expectedMsg} but found \`${actual.tokenType.name}\`.`;
  }

  buildNotAllInputParsedMessage({
    firstRedundant
  }: {
    firstRedundant: IToken;
    ruleName: string;
  }): string {
    return `Expecting end of file but found \`${firstRedundant.tokenType.name}\`.`;
  }

  buildNoViableAltMessage(options: {
    expectedPathsPerAlt: TokenType[][][];
    actual: IToken[];
    previous: IToken;
    customUserDescription: string;
    ruleName: string;
  }): string {
    return defaultParserErrorProvider.buildNoViableAltMessage(options);
  }

  buildEarlyExitMessage(options: {
    expectedIterationPaths: TokenType[][];
    actual: IToken[];
    previous: IToken;
    customUserDescription: string;
    ruleName: string;
  }): string {
    return defaultParserErrorProvider.buildEarlyExitMessage(options);
  }
}

const defaultConfig: IParserConfig = {
  recoveryEnabled: true,
  nodeLocationTracking: "full",
  skipValidations: true,
  maxLookahead: 5,
  errorMessageProvider: new LangiumParserErrorMessageProvider()
};

/**
 * This class wraps the embedded actions parser of chevrotain and exposes protected methods.
 * This way, we can build the `LangiumParser` as a composition.
 */
class ChevrotainWrapper extends EmbeddedActionsParser {
  // This array is set in the base implementation of Chevrotain.
  definitionErrors: IParserDefinitionError[];

  constructor(tokens: TokenVocabulary, config?: IParserConfig) {
    super(tokens, {
      ...defaultConfig,
      ...config,
      maxLookahead: 5
    });
  }

  get IS_RECORDING(): boolean {
    return this.RECORDING_PHASE;
  }

  DEFINE_RULE(name: string, impl: RuleImpl): RuleResult {
    return this.RULE(name, impl, {
      resyncEnabled: true,
      recoveryValueFunc() {
        console.log(name, "recoveryValueFunc");
        return {
          recoveryValueFunc: name
        };
      }
    });
  }

  wrapSelfAnalysis(): void {
    this.performSelfAnalysis();
  }

  wrapConsume(idx: number, tokenType: TokenType): IToken {
    return this.consume(idx, tokenType);
  }

  wrapSubrule(idx: number, rule: RuleResult, args: Args): unknown {
    return this.subrule(idx, rule, {
      ARGS: [args]
    });
  }

  wrapOr(idx: number, choices: Alternatives): void {
    this.or(idx, choices);
  }

  wrapOption(idx: number, callback: DSLMethodOpts<unknown>): void {
    this.option(idx, callback);
  }

  wrapMany(idx: number, callback: DSLMethodOpts<unknown>): void {
    this.many(idx, callback);
  }

  wrapAtLeastOne(idx: number, callback: DSLMethodOpts<unknown>): void {
    this.atLeastOne(idx, callback);
  }
}

/**
 * Returns a check whether the given TokenVocabulary is TokenType array
 */
export function isTokenTypeArray(tokenVocabulary: TokenVocabulary): tokenVocabulary is TokenType[] {
  return (
    Array.isArray(tokenVocabulary) && (tokenVocabulary.length === 0 || "name" in tokenVocabulary[0])
  );
}

/**
 * Returns a check whether the given TokenVocabulary is IMultiModeLexerDefinition
 */
export function isIMultiModeLexerDefinition(
  tokenVocabulary: TokenVocabulary
): tokenVocabulary is IMultiModeLexerDefinition {
  return tokenVocabulary && "modes" in tokenVocabulary && "defaultMode" in tokenVocabulary;
}

/**
 * Returns a check whether the given TokenVocabulary is TokenTypeDictionary
 */
export function isTokenTypeDictionary(
  tokenVocabulary: TokenVocabulary
): tokenVocabulary is TokenTypeDictionary {
  return !isTokenTypeArray(tokenVocabulary) && !isIMultiModeLexerDefinition(tokenVocabulary);
}

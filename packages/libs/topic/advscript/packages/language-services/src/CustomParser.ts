import {
  IMultiModeLexerDefinition,
  IParserConfig,
  ISerializedGast,
  Lexer,
  TokenType,
} from "chevrotain";
import {
  AbstractElement,
  Action,
  Alternatives,
  AstNode,
  Cardinality,
  CrossReference,
  DatatypeSymbol,
  getTypeName,
  Grammar,
  Group,
  hasContainerOfType,
  isAction,
  isAlternatives,
  isArrayOperator,
  isAssignment,
  isCrossReference,
  isDataTypeRule,
  isGroup,
  isKeyword,
  isParserRule,
  isRuleCall,
  isTerminalRule,
  isUnorderedGroup,
  Keyword,
  LangiumDocument,
  ParseResult,
  ParserRule,
  RuleCall,
  stream,
  streamAllContents,
  UnorderedGroup,
  CstNode,
} from "langium";
import type { AdvScriptServices } from ".";
import { LangiumParser } from "./langium-parser";
import { createCstGenerator } from "./_utils";

declare module "langium" {
  interface CstNode {
    indexInParent?: number;
    indexInRoot?: number;
    payload?: any;
  }
}
declare module "langium/lib/parser/cst-node-builder" {
  interface AbstractCstNode extends CstNode {}
}

type RuleContext = {
  optional: number;
  consume: number;
  subrule: number;
  many: number;
  or: number;
} & ParserContext;

type ParserContext = {
  parser: LangiumParser;
  tokens: Map<string, TokenType>;
  rules: Map<string, Method>;
};

type Method = () => void;

export function createCustomParser(services: AdvScriptServices) {
  console.groupCollapsed("createCustomParser");
  const grammar = services.Grammar;
  const tokens = new Map<string, TokenType>();
  const tokensRecords = {} as Record<string, TokenType>;
  const { TokenBuilder } = services.parser;
  const buildTokens = TokenBuilder.buildTokens(grammar);
  buildTokens.forEach((e) => {
    tokens.set(e.name, e);
    tokensRecords[e.name] = e;
  });
  const rules = new Map<string, Method>();

  console.log(buildTokens);
  // console.log(
  //   new Lexer([
  //     tokens.get("NUMBER"),
  //     tokens.get("ID"),
  //     tokens.get("ESC"),
  //     tokens.get("WS"),
  //     tokens.get("OTHER"),
  //   ]).tokenize("1 abs 我是谁 我是谁abs 1我是谁 1我是谁abs")
  // );
  const parser = new CustomParser(
    services,
    buildTokens,
    tokensRecords,
    TokenBuilder.createMultiModeLexerDefinition(tokens, buildTokens)
  );
  const parserContext: ParserContext = {
    parser,
    tokens,
    rules,
  };
  buildParserRules(parserContext, grammar);
  parser.finalize();
  console.groupEnd();
  return parser;
}

export class CustomParser extends LangiumParser {
  constructor(
    protected readonly services: AdvScriptServices,
    tokens: TokenType[],
    protected readonly tokenMap?: Record<string, TokenType>,
    overwrietLexer?: IMultiModeLexerDefinition
  ) {
    super(services, tokens, new Lexer(overwrietLexer || tokens, { skipValidations: true }));
  }

  map = new WeakSet();
  parse<T extends AstNode = AstNode>(input: string | LangiumDocument<T>): ParseResult<T> {
    console.groupCollapsed("[Parser] parse");
    // this.services.references.Linker.cleanCache();
    const text = typeof input === "string" ? input : input.textDocument.getText();
    // @ts-expect-error
    this.nodeBuilder.buildRootNode(text);
    console.time("[Parser] tokenize");
    const {
      tokens: sourceTokens,
      groups,
      errors,
    } = this.services.parser.TokenBuilder.wrapTokenize(this._lexer, text);
    const tokens = sourceTokens;
    if (this.tokenMap) {
      const length = sourceTokens.length;
      for (let i = 0; i < length; i++) {
        const token = sourceTokens[i];
        const tokenType = this.tokenMap[token.tokenType.name];
        tokens[i] = Object.assign(token, {
          tokenType,
          tokenTypeIdx: tokenType.tokenTypeIdx,
        });
      }
    }
    console.timeEnd("[Parser] tokenize");
    console.log({ tokens, groups, errors });
    console.time("[Parser] parse");
    this._wrapper.input = tokens;
    //@ts-ignore
    const result = this.mainRule.call(this.wrapper);
    //@ts-ignore
    this.addHiddenTokens(result.$cstNode, groups.hidden);
    // if (typeof input !== "string") {
    //   result.$document = input;
    // }
    console.timeEnd("[Parser] parse");
    console.groupEnd();
    for (const node of createCstGenerator((result as AstNode).$cstNode)) {
      const { node: child, ...other } = node;
      Object.assign(child, other);
    }
    this.map.add(result);
    // console.log(this.map)
    return {
      value: result,
      lexerErrors: errors,
      //@ts-ignore
      parserErrors: this.wrapper.errors,
    };
  }

  getSerializedGastProductions(): ISerializedGast[] {
    return this._wrapper.getSerializedGastProductions();
  }
}
export type { ISerializedGast };

function getRule(ctx: ParserContext, name: string): Method {
  const rule = ctx.rules.get(name);
  if (!rule) throw new Error();
  return rule;
}

function getToken(ctx: ParserContext, name: string): TokenType {
  const token = ctx.tokens.get(name);
  if (!token) throw new Error();
  return token;
}

function buildParserRules(parserContext: ParserContext, grammar: Grammar): void {
  for (const rule of stream(grammar.rules).filter(isParserRule)) {
    const ctx: RuleContext = {
      ...parserContext,
      consume: 1,
      optional: 1,
      subrule: 1,
      many: 1,
      or: 1,
    };
    const method = (rule.entry ? ctx.parser.MAIN_RULE : ctx.parser.DEFINE_RULE).bind(ctx.parser);
    const type = rule.fragment
      ? undefined
      : isDataTypeRule(rule)
      ? DatatypeSymbol
      : getTypeName(rule);
    ctx.rules.set(rule.name, method(rule.name, type, buildRuleContent(ctx, rule)));
  }
}

function buildRuleContent(ctx: RuleContext, rule: ParserRule): () => unknown {
  const method = buildElement(ctx, rule.alternatives);
  const arrays: string[] = [];
  streamAllContents(rule.alternatives).forEach((e) => {
    const item = e.node;
    if (isAssignment(item) && isArrayOperator(item.operator)) {
      arrays.push(item.feature);
    }
  });
  return () => {
    ctx.parser.initializeElement(arrays);
    method();
    return ctx.parser.construct();
  };
}

function buildElement(ctx: RuleContext, element: AbstractElement): Method {
  let method: Method;
  if (isKeyword(element)) {
    method = buildKeyword(ctx, element);
  } else if (isAction(element)) {
    method = buildAction(ctx, element);
  } else if (isAssignment(element)) {
    method = buildElement(ctx, element.terminal);
  } else if (isCrossReference(element)) {
    method = buildCrossReference(ctx, element);
  } else if (isRuleCall(element)) {
    method = buildRuleCall(ctx, element);
  } else if (isAlternatives(element)) {
    method = buildAlternatives(ctx, element);
  } else if (isUnorderedGroup(element)) {
    method = buildUnorderedGroup(ctx, element);
  } else if (isGroup(element)) {
    method = buildGroup(ctx, element);
  } else {
    throw new Error();
  }
  return wrap(ctx, method, element.cardinality);
}

function buildRuleCall(ctx: RuleContext, ruleCall: RuleCall): Method {
  const rule = ruleCall.rule.ref;
  if (isParserRule(rule)) {
    const idx = ctx.subrule++;
    if (hasContainerOfType(ruleCall, isAssignment) || isDataTypeRule(rule)) {
      return () => ctx.parser.subrule(idx, getRule(ctx, rule.name), ruleCall);
    } else {
      return () => ctx.parser.unassignedSubrule(idx, getRule(ctx, rule.name), ruleCall);
    }
  } else if (isTerminalRule(rule)) {
    const idx = ctx.consume++;
    const method = getToken(ctx, rule.name);
    return () => ctx.parser.consume(idx, method, ruleCall);
  } else {
    throw new Error();
  }
}

function buildAlternatives(ctx: RuleContext, alternatives: Alternatives): Method {
  if (alternatives.elements.length === 1) {
    return buildElement(ctx, alternatives.elements[0]);
  } else {
    const methods: Method[] = [];

    for (const element of alternatives.elements) {
      methods.push(buildElement(ctx, element));
    }

    const idx = ctx.or++;
    return () => ctx.parser.alternatives(idx, methods);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildUnorderedGroup(ctx: RuleContext, group: UnorderedGroup): Method {
  throw new Error("Unordered groups are not supported (yet)");
}

function buildGroup(ctx: RuleContext, group: Group): Method {
  const methods: Method[] = [];

  for (const element of group.elements) {
    methods.push(buildElement(ctx, element));
  }

  return () => methods.forEach((e) => e());
}

function buildAction(ctx: RuleContext, action: Action): Method {
  return () => ctx.parser.action(action.type, action);
}

function buildCrossReference(ctx: RuleContext, crossRef: CrossReference): Method {
  const terminal = crossRef.terminal;
  if (!terminal) {
    const idx = ctx.consume++;
    const idToken = getToken(ctx, "ID");
    return () => ctx.parser.consume(idx, idToken, crossRef);
  } else if (isRuleCall(terminal) && isParserRule(terminal.rule.ref)) {
    const idx = ctx.subrule++;
    const name = terminal.rule.ref.name;
    return () => ctx.parser.subrule(idx, getRule(ctx, name), crossRef);
  } else if (isRuleCall(terminal) && isTerminalRule(terminal.rule.ref)) {
    const idx = ctx.consume++;
    const terminalRule = getToken(ctx, terminal.rule.ref.name);
    return () => ctx.parser.consume(idx, terminalRule, crossRef);
  } else {
    throw new Error();
  }
}

function buildKeyword(ctx: RuleContext, keyword: Keyword): Method {
  const idx = ctx.consume++;
  const token = ctx.tokens.get(keyword.value);
  if (!token) {
    throw new Error();
  }
  return () => ctx.parser.consume(idx, token, keyword);
}

function wrapError(method: Method) {
  return function (...args: any[]) {
    try {
      method.apply(this, args);
    } catch (error) {
      // console.error(error.message);
    }
  };
}
function wrap(ctx: RuleContext, method: Method, cardinality: Cardinality): Method {
  method = wrapError(method);
  if (!cardinality) {
    return method;
  } else if (cardinality === "*") {
    const idx = ctx.many++;
    return () => ctx.parser.many(idx, method);
  } else if (cardinality === "+") {
    const idx = ctx.many++;
    return () => ctx.parser.atLeastOne(idx, method);
  } else if (cardinality === "?") {
    const idx = ctx.optional++;
    return () => ctx.parser.optional(idx, method);
  } else {
    throw new Error();
  }
}

const defaultConfig: IParserConfig = {
  recoveryEnabled: true,
  nodeLocationTracking: "full",
  skipValidations: true,
};
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/naming-convention */
import {
  EMPTY_ALT,
  IMultiModeLexerDefinition,
  IOrAlt,
  IParserConfig,
  ISerializedGast,
  Lexer,
  TokenType,
  TokenTypeDictionary,
  TokenVocabulary,
  IToken,
  MismatchedTokenException,
  EarlyExitException
} from "chevrotain";
import {
  AbstractElement,
  Action,
  Alternatives,
  AstNode,
  Cardinality,
  Condition,
  CrossReference,
  CstNode,
  DatatypeSymbol,
  findNameAssignment,
  getTypeName,
  Grammar,
  Group,
  hasContainerOfType,
  isAction,
  isAlternatives,
  isArrayOperator,
  isAssignment,
  isConjunction,
  isCrossReference,
  isDataTypeRule,
  isDisjunction,
  isGroup,
  isIMultiModeLexerDefinition,
  isKeyword,
  isLiteralCondition,
  isNegation,
  isParameterReference,
  isParserRule,
  isRuleCall,
  isTerminalRule,
  isTokenTypeDictionary,
  isUnorderedGroup,
  Keyword,
  LangiumDocument,
  NamedArgument,
  ParseResult,
  ParserRule,
  RuleCall,
  stream,
  streamAllContents,
  UnorderedGroup
} from "langium";
import { cloneDeep } from "lodash";
import type { AdvScriptServices } from ".";
import { LangiumParser } from "./langium-parser";
import { createCstGenerator, getDebuggerName, setDebuggerName } from "./_utils";

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

export function createCustomParser(services: AdvScriptServices) {
  console.groupCollapsed("createCustomParser");
  const grammar = services.Grammar;
  // const tokens = new Map<string, TokenType>();
  const { TokenBuilder } = services.parser;
  const buildTokens = TokenBuilder.buildTokens(grammar, {
    caseInsensitive: services.LanguageMetaData.caseInsensitive
  });
  const tokens = TokenBuilder.tokensRecords; //toTokenTypeDictionary(TokenBuilder.tokenArray);
  // const buildTokens = TokenBuilder.createMultiModeLexerDefinition(new Map(Object.entries(tokens)), Object.values(tokens));
  const rules = new Map<string, Rule>();
  // console.log(cloneDeep(tokens), cloneDeep(TokenBuilder.tokenArray))
  console.log(tokens, buildTokens);
  // console.log(buildTokens);
  // console.log(
  //   new Lexer([
  //     tokens.get("NUMBER"),
  //     tokens.get("ID"),
  //     tokens.get("ESC"),
  //     tokens.get("WS"),
  //     tokens.get("OTHER"),
  //   ]).tokenize("1 abs 我是谁 我是谁abs 1我是谁 1我是谁abs")
  // );
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const parser = new CustomParser(services, buildTokens, tokens);
  const parserContext: ParserContext = {
    parser,
    tokens,
    rules
  };
  buildParserRules(parserContext, grammar);
  parser.finalize();
  console.groupEnd();
  return parser;
}

export class CustomParser extends LangiumParser {
  map = new WeakSet();
  constructor(
    protected readonly services: AdvScriptServices,
    public readonly tokens: TokenVocabulary,
    protected readonly tokenMap: Record<string, TokenType>
  ) {
    super(services, tokens, tokenMap);
  }

  parse<T extends AstNode = AstNode>(input: string | LangiumDocument<T>): ParseResult<T> {
    console.groupCollapsed("[Parser] parse");
    // console.log(input)
    // this.services.references.Linker.cleanCache();
    const text = typeof input === "string" ? input : input.textDocument.getText();
    // @ts-expect-error
    this.nodeBuilder.buildRootNode(text);
    console.time("[Parser] tokenize");
    const {
      tokens: sourceTokens,
      groups,
      errors
    } = this.services.parser.TokenBuilder.wrapTokenize(this._lexer, text);
    const tokens = [] as IToken[];
    if (this.tokenMap) {
      const length = sourceTokens.length;
      for (let i = 0; i < length; i++) {
        const token = sourceTokens[i];
        const tokenType = this.tokenMap[token.tokenType.name];
        tokens[i] = {
          ...token,
          tokenType,
          tokenTypeIdx: tokenType.tokenTypeIdx
        };
        setDebuggerName(tokens[i], getDebuggerName(token.tokenType));
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
    console.log(result);
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
      parserErrors: this.wrapper.errors.map((err) => {
        if (err instanceof MismatchedTokenException || err instanceof EarlyExitException) {
          const {
            token: { ...token },
            previousToken
          } = err;
          if (token.image === "" && (isNaN(token.startOffset) || isNaN(token.endOffset))) {
            token.startOffset = token.endOffset = previousToken.endOffset;
            token.startColumn = token.endColumn = previousToken.endColumn;
            token.startLine = token.endLine = previousToken.endLine;
            err.token = token;
          }
        }
        return err;
      })
    };
  }

  getSerializedGastProductions(): ISerializedGast[] {
    return this._wrapper.getSerializedGastProductions();
  }
}

type RuleContext = {
  optional: number;
  consume: number;
  subrule: number;
  many: number;
  or: number;
} & ParserContext;

interface ParserContext {
  parser: LangiumParser;
  tokens: TokenTypeDictionary;
  rules: Map<string, Rule>;
}

type Rule = () => unknown;

type Args = Record<string, boolean>;

type Predicate = (args: Args) => boolean;

type Method = (args: Args) => void;

function toTokenTypeDictionary(buildTokens: TokenVocabulary): TokenTypeDictionary {
  if (isTokenTypeDictionary(buildTokens)) return buildTokens;
  const tokens = isIMultiModeLexerDefinition(buildTokens)
    ? Object.values(buildTokens.modes).flat()
    : buildTokens;
  const res: TokenTypeDictionary = {};
  tokens.forEach((token) => {
    res[token.name] = token;
  });
  return res;
}

function getRule(ctx: ParserContext, name: string): Rule {
  const rule = ctx.rules.get(name);
  if (!rule) throw new Error(`Rule "${name}" not found."`);
  return rule;
}

function getToken(ctx: ParserContext, name: string): TokenType {
  const token = ctx.tokens[name];
  if (!token) throw new Error(`Token "${name}" not found."`);
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
      or: 1
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

function buildRuleContent(ctx: RuleContext, rule: ParserRule): Method {
  const method = buildElement(ctx, rule.alternatives);
  const arrays: string[] = [];
  streamAllContents(rule.alternatives).forEach((item) => {
    if (isAssignment(item) && isArrayOperator(item.operator)) {
      arrays.push(item.feature);
    }
  });
  return (args) => {
    ctx.parser.initializeElement(arrays);
    method(args);
    return ctx.parser.construct();
  };
}

function buildElement(ctx: RuleContext, element: AbstractElement, ignoreGuard = false): Method {
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
  return wrap(
    ctx,
    ignoreGuard ? undefined : getGuardCondition(element),
    method,
    element.cardinality
  );
}

function buildRuleCall(ctx: RuleContext, ruleCall: RuleCall): Method {
  const rule = ruleCall.rule.ref;
  if (isParserRule(rule)) {
    const idx = ctx.subrule++;
    const predicate =
      ruleCall.arguments.length > 0 ? buildRuleCallPredicate(rule, ruleCall.arguments) : () => ({});
    if (hasContainerOfType(ruleCall, isAssignment)) {
      return (args) => ctx.parser.subrule(idx, getRule(ctx, rule.name), ruleCall, predicate(args));
    } else {
      return (args) =>
        ctx.parser.unassignedSubrule(idx, getRule(ctx, rule.name), ruleCall, predicate(args));
    }
  } else if (isTerminalRule(rule)) {
    const idx = ctx.consume++;
    const method = getToken(ctx, rule.name);
    return () => ctx.parser.consume(idx, method, ruleCall);
  } else {
    throw new Error();
  }
}

function buildRuleCallPredicate(
  rule: ParserRule,
  namedArgs: NamedArgument[]
): (args: Args) => Args {
  const predicates = namedArgs.map((e) => buildPredicate(e.value));
  return (args) => {
    const ruleArgs: Args = {};
    for (let i = 0; i < predicates.length; i++) {
      const ruleTarget = rule.parameters[i];
      const predicate = predicates[i];
      ruleArgs[ruleTarget.name] = predicate(args);
    }
    return ruleArgs;
  };
}

interface PredicatedMethod {
  ALT: Method;
  GATE?: Predicate;
}

function buildPredicate(condition: Condition): Predicate {
  if (isDisjunction(condition)) {
    const left = buildPredicate(condition.left);
    const right = buildPredicate(condition.right);
    return (args) => left(args) || right(args);
  } else if (isConjunction(condition)) {
    const left = buildPredicate(condition.left);
    const right = buildPredicate(condition.right);
    return (args) => left(args) && right(args);
  } else if (isNegation(condition)) {
    const value = buildPredicate(condition.value);
    return (args) => !value(args);
  } else if (isParameterReference(condition)) {
    const name = condition.parameter.ref!.name;
    return (args) => args[name] === true;
  } else if (isLiteralCondition(condition)) {
    const value = !!condition.true;
    return () => value;
  }
  throw new Error();
}

function buildAlternatives(ctx: RuleContext, alternatives: Alternatives): Method {
  if (alternatives.elements.length === 1) {
    return buildElement(ctx, alternatives.elements[0]);
  } else {
    const methods: PredicatedMethod[] = [];

    for (const element of alternatives.elements) {
      const predicatedMethod: PredicatedMethod = {
        // Since we handle the guard condition in the alternative already
        // We can ignore the group guard condition inside
        ALT: buildElement(ctx, element, true)
      };
      const guard = getGuardCondition(element);
      if (guard) {
        predicatedMethod.GATE = buildPredicate(guard);
      }
      methods.push(predicatedMethod);
    }

    const idx = ctx.or++;
    return (args) =>
      ctx.parser.alternatives(
        idx,
        methods.map((method) => {
          const alt: IOrAlt<unknown> = {
            ALT: () => method.ALT(args)
          };
          const gate = method.GATE;
          if (gate) {
            alt.GATE = () => gate(args);
          }
          return alt;
        })
      );
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

  return (args) => methods.forEach((e) => e(args));
}

function getGuardCondition(element: AbstractElement): Condition | undefined {
  if (isGroup(element)) {
    return element.guardCondition;
  }
  return undefined;
}

function buildAction(ctx: RuleContext, action: Action): Method {
  const actionType = getTypeName(action);
  return () => ctx.parser.action(actionType, action);
}

function buildCrossReference(
  ctx: RuleContext,
  crossRef: CrossReference,
  terminal = crossRef.terminal
): Method {
  if (!terminal) {
    if (!crossRef.type.ref) {
      throw new Error("Could not resolve reference to type: " + crossRef.type.$refText);
    }
    const assignment = findNameAssignment(crossRef.type.ref);
    const assignTerminal = assignment?.terminal;
    if (!assignTerminal) {
      throw new Error("Could not find name assignment for type: " + getTypeName(crossRef.type.ref));
    }
    return buildCrossReference(ctx, crossRef, assignTerminal);
  } else if (isRuleCall(terminal) && isParserRule(terminal.rule.ref)) {
    const idx = ctx.subrule++;
    const name = terminal.rule.ref.name;
    return (args) => ctx.parser.subrule(idx, getRule(ctx, name), crossRef, args);
  } else if (isRuleCall(terminal) && isTerminalRule(terminal.rule.ref)) {
    const idx = ctx.consume++;
    const terminalRule = getToken(ctx, terminal.rule.ref.name);
    return () => ctx.parser.consume(idx, terminalRule, crossRef);
  } else if (isKeyword(terminal)) {
    const idx = ctx.consume++;
    const keyword = getToken(ctx, terminal.value);
    keyword.name = withKeywordSuffix(keyword.name);
    return () => ctx.parser.consume(idx, keyword, crossRef);
  } else {
    throw new Error("Could not build cross reference parser");
  }
}

const withKeywordSuffix = (name: string): string => name; //name.endsWith(':KW') ? name : name + ':KW';

function buildKeyword(ctx: RuleContext, keyword: Keyword): Method {
  const idx = ctx.consume++;
  const token = ctx.tokens[keyword.value];
  if (!token) {
    throw new Error("Could not find token for keyword: " + keyword.value);
  }
  token.name = withKeywordSuffix(token.name);
  return () => ctx.parser.consume(idx, token, keyword);
}

function wrap(
  ctx: RuleContext,
  guard: Condition | undefined,
  method: Method,
  cardinality: Cardinality
): Method {
  const gate = guard && buildPredicate(guard);

  if (!cardinality) {
    if (gate) {
      const idx = ctx.or++;
      return (args) =>
        ctx.parser.alternatives(idx, [
          {
            ALT: () => method(args),
            GATE: () => gate(args)
          },
          {
            ALT: EMPTY_ALT(),
            GATE: () => !gate(args)
          }
        ]);
    } else {
      return method;
    }
  }

  if (cardinality === "*") {
    const idx = ctx.many++;
    return (args) =>
      ctx.parser.many(idx, {
        DEF: () => method(args),
        GATE: gate ? () => gate(args) : undefined
      });
  } else if (cardinality === "+") {
    const idx = ctx.many++;
    if (gate) {
      const orIdx = ctx.or++;
      // In the case of a guard condition for the `+` group
      // We combine it with an empty alternative
      // If the condition returns true, it needs to parse at least a single iteration
      // If its false, it is not allowed to parse anything
      return (args) =>
        ctx.parser.alternatives(orIdx, [
          {
            ALT: () =>
              ctx.parser.atLeastOne(idx, {
                DEF: () => method(args)
              }),
            GATE: () => gate(args)
          },
          {
            ALT: EMPTY_ALT(),
            GATE: () => !gate(args)
          }
        ]);
    } else {
      return (args) =>
        ctx.parser.atLeastOne(idx, {
          DEF: () => method(args)
        });
    }
  } else if (cardinality === "?") {
    const idx = ctx.optional++;
    return (args) =>
      ctx.parser.optional(idx, {
        DEF: () => method(args),
        GATE: gate ? () => gate(args) : undefined
      });
  } else {
    throw new Error();
  }
}

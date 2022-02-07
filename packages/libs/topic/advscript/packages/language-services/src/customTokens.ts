import {
  createToken,
  createTokenInstance,
  CustomPatternMatcherFunc,
  Lexer,
  IToken,
  TokenType,
  TokenPattern,
  IMultiModeLexerDefinition,
} from "chevrotain";
import { Grammar } from "langium";
import { DefaultTokenBuilder, TokenBuilder } from "langium/lib/parser/token-builder";
import { TokenTypeWrapper, cloneTokens } from "./_utils";
import { partialRight, last, isEmpty, findLastIndex } from "lodash";
import * as ast from "./ast";

export class CustomTokenBuilder extends DefaultTokenBuilder implements TokenBuilder {
  buildTokens(grammar: Grammar): TokenType[] {
    const tokens = super.buildTokens(grammar);
    console.log("CustomTokenBuilder", grammar);
    return tokens
      .map((token) => {
        if (token.name === ast.EOL) {
          return this.wrapEOL(token);
        }
        if (token.name === ast.OTHER) {
          console.log(token);
          const PATTERN = token.PATTERN as RegExp;
          const pattern =
            // eslint-disable-next-line no-control-regex
            / +|(([^\x00-\xff]|\w|\W)(([^\x00-\xff]|\w|(?!\[|\]|\\|\{|\}|=|\(|\?|\)|\s|,|:|'|"|\|)\W))*)/;
          return Object.assign<TokenType, Partial<TokenType>>(token, {
            PATTERN(text, offset, tokens) {
              const last = tokens[tokens.length - 1];
              const result = new RegExp(pattern.source, "y").exec(text.slice(offset));
              // if (result && last.tokenType.name === ast.OTHER) {
              //   last.endColumn += result[0].length;
              //   last.endColumn += result[0].length;
              //   last.endOffset += result[0].length;
              //   last.image += result[0]
              //   return null;
              // }
              return result;
              // return Object.assign([] as string[], {
              //   payload: {}
              // })
            },
            LINE_BREAKS: false,
          });
        } else {
          if (token.LONGER_ALT instanceof Array) {
            token.LONGER_ALT = token.LONGER_ALT.filter((token) => token.name !== ast.OTHER);
          }
        }
        return token;
      })
      .sort((o, b) => {
        if (o.name === ast.OTHER) {
          return 1;
        }
        if (b.name === ast.OTHER) {
          return -1;
        }
        if (o.name === "Escapse") {
          return 1;
        }
        if (b.name === "Escapse") {
          return -1;
        }
        return 0;
      });
  }
  indentStack = [0];
  newLines: IToken[] = [];

  testAt(
    reg: TokenPattern,
    text: string,
    offset: number,
    tokens: IToken[],
    groups: {
      [groupName: string]: IToken[];
    }
  ) {
    if (typeof reg === "string") {
      return text.startsWith(reg, offset);
    } else if (reg instanceof RegExp) {
      return reg.test(text.slice(offset));
    } else if (reg instanceof Function) {
      return !!reg(text, offset, tokens, groups);
    }
    return !!reg.exec(text, offset, tokens, groups);
  }
  
  execAt(
    reg: TokenPattern,
    text: string,
    offset: number,
    tokens?: IToken[],
    groups?: {
      [groupName: string]: IToken[];
    }
  ): RegExpExecArray {
    if (typeof reg === "string") {
      return text.slice(offset).match(reg) as RegExpExecArray;
    } else if (reg instanceof RegExp) {
      reg.lastIndex = offset;
      return reg.exec(text);
    } else if (reg instanceof Function) {
      return reg(text, offset, tokens, groups) as RegExpExecArray;
    }
    return reg.exec(text, offset, tokens, groups) as RegExpExecArray;
  }

  /**
   * This custom Token matcher uses Lexer context ("matchedTokens" and "groups" arguments)
   * combined with state via closure ("this.indentStack" and "lastTextMatched") to match indentation.
   *
   * @param  text - the full text to lex, sent by the Chevrotain lexer.
   * @param  offset - the offset to start matching in the text.
   * @param  tokens - Tokens lexed so far, sent by the Chevrotain Lexer.
   * @param  groups - Token groups already lexed, sent by the Chevrotain Lexer.
   * @param  type - determines if this function matches Indent or Outdent tokens.
   * @returns
   */
  matchIndentBase: CustomPatternMatcherFunc = (
    text,
    offset,
    tokens,
    groups,
    type?: typeof ast.Indent | typeof ast.Outdent
  ) => {
    const { currIndentLevel, match, prevIndentLevel, lastToken } = this.getIndentLevel(
      tokens,
      text,
      offset
    );
    if (currIndentLevel > -1 && currIndentLevel !== prevIndentLevel) {
      // deeper indentation
      if (
        currIndentLevel > prevIndentLevel &&
        type === ast.Indent &&
        this.matchLastLogic(tokens, lastToken) &&
        !this.testAt(/^\r?\n/, text, offset + currIndentLevel, tokens, groups)
      ) {
        this.indentStack.push(currIndentLevel);
        return match;
      }
      // shallower indentation
      else if (currIndentLevel < prevIndentLevel && type === ast.Outdent) {
        const matchIndentIndex = findLastIndex(
          this.indentStack,
          (stackIndentDepth) => stackIndentDepth === currIndentLevel
        );

        if (
          matchIndentIndex > -1 &&
          this.matchLogicEnd(text, offset + currIndentLevel, tokens, groups)
        ) {
          const numberOfDedents = this.indentStack.length - matchIndentIndex - 1;
          // This is a little tricky
          // 1. If there is no match (0 level indent) than this custom token
          //    matcher would return "null" and so we need to add all the required outdents ourselves.
          // 2. If there was match (> 0 level indent) than we need to add minus one number of outsents
          //    because the lexer would create one due to returning a none null result.
          const iStart = match !== null ? 1 : 0;
          for (let i = iStart; i < numberOfDedents; i++) {
            this.indentStack.pop();
            tokens.push(this.createOutdent(lastToken));
          }
          // even though we are adding fewer outdents directly we still need to update the indent stack fully.
          if (iStart === 1) {
            this.indentStack.pop();
          }
        } else if (this.matchLogicEnd(text, offset + currIndentLevel, tokens, groups)) {
          this.indentStack.pop();
          // tokens.push(this.createOutdent(lastToken));
          // any outdent must match some previous indentation level.
          // throw Error(`invalid outdent at offset: ${offset}`);
          return match;
        } else {
          return null;
        }
        return match;
      }
      // same indent, this should be lexed as simple whitespace and ignored
    }
    // indentation cannot be matched under other circumstances
    return null;
  };

  // customize matchIndentBase to create separate functions of Indent and Outdent.
  Indent = createToken({
    name: ast.Indent,
    pattern: partialRight(this.matchIndentBase, ast.Indent),
    // custom token patterns should explicitly specify the line_breaks option
    line_breaks: false,
    start_chars_hint: ["|", " "],
  });
  // customize matchIndentBase to create separate functions of Indent and Outdent.
  Outdent = createToken({
    name: ast.Outdent,
    pattern: partialRight(this.matchIndentBase, ast.Outdent),
    // custom token patterns should explicitly specify the line_breaks option
    line_breaks: false,
    start_chars_hint: ["|", " "],
  });
  EOL: TokenType;
  private matchLogicEnd(
    text: string,
    offset: number,
    tokens: IToken[],
    groups: { [groupName: string]: IToken[] }
  ) {
    return this.testAt(
      /^(\|(elseif|else|end)|\r?\n(?!\s+\|(elseif|else|end)))/,
      text,
      offset,
      tokens,
      groups
    );
  }

  private createOutdent(prevToken: IToken): IToken {
    return createTokenInstance(
      this.Outdent,
      "",
      prevToken.endOffset,
      prevToken.endOffset,
      prevToken.endLine,
      prevToken.endLine,
      prevToken.endColumn,
      prevToken.endColumn
    );
  }

  returnTokens({ cloneToken }: TokenTypeWrapper) {
    // State required for matching the indentations

    const WS = cloneToken(ast.WS);
    const hiddenIndent = this.createHiddenIndent(cloneToken, WS);
    // newlines are not skipped, by setting their group to "nl" they are saved in the lexer result
    // and thus we can check before creating an indentation token that the last token matched was a newline.
    this.EOL = cloneToken(ast.EOL);
    // define the indentation tokens using custom token patterns
    return [this.EOL, this.Outdent, this.Indent, hiddenIndent, WS];
  }

  private createHiddenIndent(
    cloneToken: (
      name: string | TokenType,
      merge?: Partial<TokenType> | ((token: TokenType) => Partial<TokenType>)
    ) => TokenType,
    WS: TokenType
  ) {
    return cloneToken(WS, (token) => ({
      name: ast.HIDDEN_INDENT,
      PATTERN: (text, offset, tokens, groups) => {
        const { matched, ...payload } = this.matchHiddenIndent(text, offset, tokens, groups);
        matched &&
          console.log("HiddenToken", matched, text.split(/\r?\n/)[payload.lastToken?.endLine]);
        return matched
          ? Object.assign(matched, {
              payload,
            })
          : matched;
      },
      GROUP: "hidden",
      START_CHARS_HINT: ["|", " "],
    }));
  }
  matchHiddenIndent(
    /**
     * The full input string.
     */
    text: string,
    /**
     * The offset at which to attempt a match
     */
    offset: number,
    /**
     * Previously scanned Tokens
     */
    tokens: IToken[],
    /**
     * Token Groups
     */
    groups: {
      [groupName: string]: IToken[];
    }
  ) {
    const { match, currIndentLevel, prevIndentLevel, lastToken, matchIndentLevel } =
      this.getIndentLevel(tokens, text, offset, true);
    if (currIndentLevel > -1) {
      if (currIndentLevel === prevIndentLevel) {
        // if (match) {
        //   const nextIndent = Math.min(prevIndentLevel + 2, currIndentLevel);
        //   const [matched] = match;
        //   matchedTokens.push(
        //     createTokenWithPrev(
        //       this.Indent,
        //       matched.slice(0, nextIndent),
        //       offset,
        //       last(matchedTokens)
        //     )
        //   );
        //   this.indentStack.push(nextIndent);
        // }
        return { matched: match, currIndentLevel, prevIndentLevel, lastToken, matchIndentLevel };
      }
      if (match) {
        const [matched] = match;
        if (currIndentLevel > prevIndentLevel) {
          if (
            this.matchLastLogic(tokens, lastToken) &&
            !this.testAt(/^\|let/, text, offset + currIndentLevel, tokens, groups)
          ) {
            const nextIndent = currIndentLevel;
            const sliceIndent = nextIndent; //currIndentLevel < nextIndent ? prevIndentLevel : nextIndent;
            // if (
            //   prevIndentLevel > 0
            //   // ||
            //   // this.testAt(/^\|/, text, offset + currIndentLevel, matchedTokens, groups)
            // ) {
            // if (!this.testAt(/^\|/, text, offset + currIndentLevel, matchedTokens, groups)) {
            // if (sliceIndent > 0 && sliceIndent !== nextIndent) {
            if (!this.testAt(/^\r?\n/, text, offset + currIndentLevel, tokens, groups)) {
              tokens.push(
                createTokenWithPrev(this.Indent, matched.slice(0, sliceIndent), offset, lastToken)
              );
              this.indentStack.push(sliceIndent);
            }
            // }
            // } else {
            //   matchedTokens.push(
            //     createTokenWithPrev(WS, matched.slice(0, nextIndent), offset, last(matchedTokens))
            //   );
            // }
            match[0] = matched.slice(0, sliceIndent);
            // console.log("create", match);
            // const { match } = this.getIndentLevel(
            //   matchedTokens,
            //   text,
            //   offset + (currIndentLevel - prevIndentLevel)
            // );
            return {
              matched: match,
              currIndentLevel,
              prevIndentLevel,
              lastToken,
              matchIndentLevel,
            };
            // }
          } else if (prevIndentLevel > 0) {
            match[0] = matched.slice(0, prevIndentLevel);
            return {
              matched: match,
              currIndentLevel,
              prevIndentLevel,
              lastToken,
              matchIndentLevel,
            };
          }
        } else if (currIndentLevel < prevIndentLevel) {
          // if (!this.testAt(/^(\r?\n|\|)/, text, offset + currIndentLevel, tokens, groups)) {
          //   if (currIndentLevel > 0) {
          //     tokens.push(this.createOutdent(last(tokens)));
          //     this.indentStack.pop();
          //     tokens.push(
          //       createTokenWithPrev(
          //         this.Indent,
          //         matched.slice(0, currIndentLevel),
          //         offset,
          //         last(tokens)
          //       )
          //     );
          //     this.indentStack.push(currIndentLevel);
          //   } else {
          //     tokens.push(
          //       createTokenWithPrev(
          //         this.Outdent,
          //         matched.slice(0, currIndentLevel),
          //         offset,
          //         last(tokens)
          //       )
          //     );
          //     this.indentStack.pop();
          //   }
          // }
          return { matched: match, currIndentLevel, prevIndentLevel, lastToken, matchIndentLevel };
        }
      }
    }
    return { matched: null, currIndentLevel, prevIndentLevel, lastToken, matchIndentLevel };
  }

  private matchLastLogic(tokens: IToken[], lastToken = tokens[tokens.length - 1]) {
    let matchedLogic: IToken;
    for (let i = tokens.length - 1; i >= 0; i--) {
      matchedLogic = tokens[i];
      if (matchedLogic.tokenType.name === ast.WS || matchedLogic.tokenType.name === ast.EOL) {
        lastToken = matchedLogic;
        continue;
      }
      if (
        matchedLogic.tokenType.name === "|if" ||
        matchedLogic.tokenType.name === "|elseif" ||
        matchedLogic.tokenType.name === "|else" ||
        matchedLogic.tokenType.name === "|while" ||
        matchedLogic.tokenType.name === "|foreach"
      ) {
        return matchedLogic;
      } else if (
        matchedLogic.startLine < lastToken.startLine ||
        matchedLogic.tokenType.name === ast.OTHER ||
        matchedLogic.tokenType.name === ast.ESC
      ) {
        return;
      }
    }
  }
  private getIndentLevel(tokens: IToken[], text: string, offset: number, matchHidden = false) {
    const noTokensMatchedYet = isEmpty(tokens);
    // const newLines = groups.nl;
    // console.log([...matchedTokens])
    const noNewLinesMatchedYet = isEmpty(this.newLines);
    const isFirstLine = noTokensMatchedYet && noNewLinesMatchedYet;
    const isStartOfLine =
      // only newlines matched so far
      (noTokensMatchedYet && !noNewLinesMatchedYet) ||
      // Both newlines and other Tokens have been matched AND the offset is just after the last newline
      (!noTokensMatchedYet &&
        !noNewLinesMatchedYet &&
        offset === last(this.newLines).endOffset + 1);

    // indentation can only be matched at the start of a line.
    const isIdentation = isFirstLine || isStartOfLine;
    const lastToken = tokens[tokens.length - 1];
    let currIndentLevel: number,
      match: RegExpExecArray = null,
      prevIndentLevel: number,
      matchIndentLevel: number;
    if (isIdentation) {
      match = this.execAt(/( {2})+/y, text, offset);
      prevIndentLevel = last(this.indentStack);
      matchIndentLevel = prevIndentLevel + (matchHidden ? 0 : 2);
      // possible non-empty indentation
      if (match !== null) {
        currIndentLevel = Math.min(match[0].length, prevIndentLevel + 2);
        match[0] = match[0].slice(0, currIndentLevel);
      }
      // "empty" indentation means indentLevel of 0.
      else {
        currIndentLevel = 0;
      }
      // console.log(currIndentLevel, prevIndentLevel);
    } else {
      currIndentLevel = -1;
    }
    return {
      currIndentLevel,
      prevIndentLevel,
      matchIndentLevel,
      match,
      lastToken,
    };
  }

  wrapTokenize(lexer: Lexer, text: string) {
    // have to reset the indent stack between processing of different text inputs
    this.newLines = [];
    this.indentStack = [0];

    const lexResult = lexer.tokenize(text);
    // console.log(this.indentStack, this.newLines);
    //add remaining Outdents
    const prevToken = last(lexResult.tokens);
    while (this.indentStack.length > 1) {
      lexResult.tokens.push(this.createOutdent(prevToken));
      this.indentStack.pop();
    }
    // const endToken = last(lexResult.tokens);
    // if (prevToken.tokenType.name !== 'EOL') {
    // lexResult.tokens.push(
    //   createTokenInstance(
    //     this.EOL,
    //     "\r\n",
    //     endToken.endOffset+1,
    //     endToken.endOffset+1,
    //     endToken.endLine,
    //     endToken.endLine,
    //     endToken.endColumn+1,
    //     endToken.endColumn+1
    //   ),
    //   createTokenInstance(
    //     this.EOL,
    //     "\r\n",
    //     endToken.endOffset+1,
    //     endToken.endOffset+1,
    //     endToken.endLine,
    //     endToken.endLine,
    //     endToken.endColumn+1,
    //     endToken.endColumn+1
    //   )
    // );
    // }

    // if (lexResult.errors.length > 0) {
    //   throw new Error("sad sad panda lexing errors detected");
    // }
    return lexResult;
  }

  createMultiModeLexerDefinition(
    tokens: Map<string, TokenType>,
    buildTokens: TokenType[]
  ): IMultiModeLexerDefinition {
    let preLoader: ReturnType<CustomTokenBuilder["returnTokens"]>;
    return {
      modes: {
        process: cloneTokens(tokens, ({ cloneToken }) => [
          createToken({
            name: "DocumentHeader",
            pattern: (text, offset, tokens, groups) => {
              if (tokens.length === 0) {
                const result = this.execAt(/^(?!\s*---\r?\n)/y, text, offset);
                if (result && this.testAt(/---\r?\n/, text, result[0].length, tokens, groups))
                  return result;
              }
              return null;
            },
            push_mode: "yaml",
            group: "hidden",
            line_breaks: false,
          }),
          ...((preLoader = this.returnTokens({ cloneToken })), preLoader),
          cloneToken("---", {
            PUSH_MODE: "yaml",
          }),
          cloneToken(ast.INLINE_COMMENT),
          cloneToken(ast.ML_COMMENT),
          cloneToken(ast.SL_COMMENT),
          cloneToken("@", {
            PUSH_MODE: "character",
          }),
          cloneToken("{{", {
            PUSH_MODE: "template",
          }),
          cloneToken("|let", {
            PUSH_MODE: "pipe",
          }),
          cloneToken("|if", {
            PUSH_MODE: "pipe",
          }),
          cloneToken("|elseif", {
            PUSH_MODE: "pipe",
          }),
          cloneToken("|else", {
            PUSH_MODE: "pipe",
          }),
          cloneToken("|end"),
          cloneToken("|", {
            PUSH_MODE: "pipe",
          }),
          // cloneToken("[@", {
          //   PUSH_MODE: "macro",
          // }),
          cloneToken("[", {
            PUSH_MODE: "macro",
          }),
          cloneToken(ast.ESC),
          cloneToken(ast.OTHER),
        ]),
        yaml: cloneTokens(tokens, ({ cloneToken }) => [
          cloneToken(ast.EOL),
          cloneToken(ast.WS),
          cloneToken(ast.ML_COMMENT),
          cloneToken(ast.SL_COMMENT),
          cloneToken("Characters"),
          cloneToken("Macros"),
          cloneToken("true"),
          cloneToken("false"),
          cloneToken("---", {
            POP_MODE: true,
          }),
          cloneToken("-"),
          cloneToken(","),
          cloneToken("(", {
            LONGER_ALT: [],
          }),
          cloneToken(")"),
          cloneToken(":"),
          cloneToken("=", {
            PUSH_MODE: "inlineExpr",
            LONGER_ALT: [],
          }),
          cloneToken(ast.ESC),
          cloneToken(ast.OTHER, { name: ast.ID }),
        ]),
        character: cloneTokens(tokens, ({ cloneToken }) => [
          cloneToken(ast.EOL, {
            POP_MODE: true,
          }),
          cloneToken(ast.WS),
          cloneToken(ast.ML_COMMENT),
          cloneToken(ast.SL_COMMENT),
          cloneToken(","),
          cloneToken("("),
          cloneToken(")"),
          cloneToken("[", {
            PUSH_MODE: "macro",
            LONGER_ALT: [],
          }),
          cloneToken(ast.ID),
          cloneToken(ast.ESC),
          cloneToken(ast.OTHER),
        ]),
        template: cloneTokens(tokens, ({ cloneToken }) =>
          buildTokens.map((token) => {
            if (token.name === "(") {
              return cloneToken(token, { PUSH_MODE: "expression" });
            }
            if (token.name === "}}") {
              return cloneToken(token, { POP_MODE: true });
            }
            if (token.name === ast.WS) {
              return cloneToken(token, { GROUP: "hidden" });
            }
            if (token.name === ast.ID) {
              return;
            }
            if (token.name === ast.OTHER) {
              return cloneToken(ast.OTHER, { name: ast.ID });
            }
            return cloneToken(token);
          })
        ),
        macro: cloneTokens(tokens, ({ cloneToken }) =>
          buildTokens.map((token) => {
            if (token.name === "(") {
              return cloneToken(token, { PUSH_MODE: "expression" });
            }
            if (token.name === "]") {
              return cloneToken(token, { POP_MODE: true });
            }
            if (token.name === "](") {
              return cloneToken(token, (token) => ({
                LINE_BREAKS: false,
                PATTERN(text, pos, list, group) {
                  const token = /\]\(/y.exec(text.slice(pos));
                  if (token) {
                    const start = list.length - 1;
                    let current = list[start];
                    let index = start;
                    const startLine = current.startLine;
                    while (current.tokenType.name !== "[") {
                      current = list[--index];
                      if (current.startLine < startLine) {
                        return token;
                      }
                    }
                    if (current) {
                      const token = cloneToken(ast.OTHER);
                      for (let i = index + 1; i <= start; i++) {
                        list[i].tokenType = token;
                        list[i].tokenTypeIdx = token.tokenTypeIdx;
                      }
                    }
                  }
                  return token;
                },
              }));
            }
            if (token.name === ")") {
              return cloneToken(token, { POP_MODE: true });
            }
            if (token.name === ast.WS) {
              return cloneToken(token, { GROUP: "hidden" });
            }
            if (token.name === ast.ID) {
              return;
            }
            if (token.name === ast.OTHER) {
              return cloneToken(ast.OTHER, { name: ast.ID });
            }
            return cloneToken(token);
          })
        ),
        pipe: cloneTokens(tokens, ({ cloneToken }) =>
          buildTokens.map((token) => {
            if (token.name === "(") {
              return cloneToken(token, { PUSH_MODE: "expression" });
            }
            if (token.name === ast.EOL) {
              return cloneToken(token, { POP_MODE: true });
            }
            if (token.name === ast.WS) {
              return cloneToken(token, { GROUP: "hidden" });
            }
            if (token.name === ast.ID) {
              return;
            }
            if (token.name === ast.OTHER) {
              return cloneToken(ast.OTHER, { name: ast.ID });
            }
            return cloneToken(token);
          })
        ),
        inlineExpr: cloneTokens(tokens, ({ cloneToken }) =>
          buildTokens.map((token) => {
            if (token.name === "(") {
              return cloneToken(token, { PUSH_MODE: "expression" });
            }
            if (token.name === ast.WS || token.name === ast.EOL) {
              return cloneToken(token, { POP_MODE: true });
            }
            if (token.name === ast.ID) {
              return;
            }
            if (token.name === ast.OTHER) {
              return cloneToken(ast.OTHER, { name: ast.ID });
            }
            return cloneToken(token);
          })
        ),
        expression: cloneTokens(tokens, ({ cloneToken }) =>
          buildTokens.map((token) => {
            if (token.name === "(") {
              return cloneToken(token, { PUSH_MODE: "expression" });
            }
            if (token.name === ")") {
              return cloneToken(token, { POP_MODE: true });
            }
            if (token.name === ast.WS) {
              return cloneToken(token, { GROUP: "hidden" });
            }
            if (token.name === ast.ID) {
              return;
            }
            if (token.name === ast.OTHER) {
              return cloneToken(ast.OTHER, { name: ast.ID });
            }
            return cloneToken(token);
          })
        ),
      },
      defaultMode: "process",
    };
  }

  wrapEOL(token: TokenType) {
    const EOL = { ...token };
    return Object.assign<TokenType, Partial<TokenType>>(token, {
      PATTERN: (text, offset, tokens, group) => {
        const result = new RegExp((EOL.PATTERN as RegExp).source, "y").exec(text.slice(offset));
        const lastToken = last(tokens);
        // console.log(text.slice(pos, text.length).length, text.length, pos, result);
        const matched = lastToken && result?.[0];
        if (matched?.length > 0) {
          const matchedToken = createTokenWithPrev(EOL, matched, offset, lastToken);
          this.newLines.push(matchedToken);
          if (lastToken?.tokenType.name !== ast.EOL && offset + matched.length === text.length) {
            tokens.push(matchedToken);
          }
        }
        return result;
      },
      // 换行符必须设置为true
      LINE_BREAKS: true,
      START_CHARS_HINT: ["\r", "\n"],
    });
  }
}

function createTokenWithPrev(
  token: TokenType,
  matched: string,
  offset: number,
  lastToken: Partial<IToken> = { endLine: 0, startColumn: 0, startLine: 0, endColumn: 0 }
): IToken {
  return createTokenInstance(
    token,
    matched,
    offset,
    offset + matched.length - 1,
    lastToken.endLine,
    lastToken.endLine,
    lastToken.endColumn + 1,
    lastToken.endColumn + matched.length
  );
}

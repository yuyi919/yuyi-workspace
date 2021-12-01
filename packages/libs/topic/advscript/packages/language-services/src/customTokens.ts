import { DefaultTokenBuilder, TokenBuilder } from "langium/lib/parser/token-builder";
import { Grammar } from "langium";
import { Lexer, TokenType, createToken, createTokenInstance } from "chevrotain";
import { cloneTokens } from "./_utils";

export class CustomTokenBuilder extends DefaultTokenBuilder implements TokenBuilder {
  buildTokens(grammar: Grammar): TokenType[] {
    const tokens = super.buildTokens(grammar);
    return tokens
      .map((token) => {
        if (token.name === "EOL") {
          const cloneToken = { ...token };
          return Object.assign<TokenType, Partial<TokenType>>(token, {
            PATTERN(text, offset, tokens, group) {
              const result = new RegExp((cloneToken.PATTERN as RegExp).source, "y").exec(
                text.slice(offset, text.length)
              );
              const last = tokens[tokens.length - 1];
              // console.log(text.slice(pos, text.length).length, text.length, pos, result);
              const matched = last && last.tokenType.name !== "EOL" && result?.[0];
              if (matched?.length > 0 && offset + matched.length === text.length) {
                tokens.push(
                  createTokenInstance(
                    cloneToken,
                    matched,
                    offset,
                    offset + matched.length - 1,
                    last.endLine,
                    last.endLine,
                    last.endColumn + 1,
                    last.endColumn + matched.length
                  )
                );
              }
              return result;
            },
            // 换行符必须设置为true
            LINE_BREAKS: true,
            START_CHARS_HINT: ["\r", "\n"],
          });
        }
        if (token.name === "OTHER") {
          console.log(token);
          const PATTERN = token.PATTERN as RegExp;
          const pattern =
            // eslint-disable-next-line no-control-regex
            /(([^\x00-\xff]|\w|\W)(([^\x00-\xff]|\w|(?!\[|\]|\\|\{|\}|\(|\)|\s|'|"|\|)\W))*)/;
          return Object.assign<TokenType, Partial<TokenType>>(token, {
            PATTERN(text, offset, tokens) {
              const last = tokens[tokens.length - 1];
              const result = new RegExp(pattern.source, "y").exec(
                text.slice(offset, text.length - 1)
              );
              // if (result && last.tokenType.name === "OTHER") {
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
            token.LONGER_ALT = token.LONGER_ALT.filter((token) => token.name !== "OTHER");
          }
        }
        return token;
      })
      .sort((o, b) => {
        if (o.name === "OTHER") {
          return 1;
        }
        if (b.name === "OTHER") {
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

  createCustomLexer(tokens: Map<string, TokenType>, buildTokens: TokenType[]): Lexer {
    return new Lexer(
      {
        modes: {
          process: cloneTokens(tokens, ({ cloneToken }) => [
            createToken({
              name: "DocumentHeader",
              pattern(text, pos, tokens, group) {
                return tokens.length === 0
                  ? /^(?!\s*---\r?\n)/y.exec(text.slice(pos, text.length))
                  : null;
              },
              push_mode: "yaml",
              group: "hidden",
              line_breaks: false,
            }),
            cloneToken("Token_YAML", {
              PUSH_MODE: "yaml",
            }),
            cloneToken("EOL"),
            tokens.get("WS"),
            tokens.get("INLINE_COMMENT"),
            tokens.get("ML_COMMENT"),
            tokens.get("SL_COMMENT"),
            cloneToken("@", {
              PUSH_MODE: "character",
            }),
            cloneToken("{{", {
              PUSH_MODE: "template",
            }),
            cloneToken("|", {
              PUSH_MODE: "pipe",
              LONGER_ALT: [],
            }),
            cloneToken("LABEL_START", {
              PUSH_MODE: "label",
            }),
            cloneToken("CallStart", {
              PUSH_MODE: "macro",
            }),
            tokens.get("ESC"),
            tokens.get("OTHER"),
          ]),
          yaml: cloneTokens(tokens, ({ cloneToken }) => [
            tokens.get("EOL"),
            tokens.get("WS"),
            tokens.get("ML_COMMENT"),
            tokens.get("SL_COMMENT"),
            tokens.get("Characters"),
            tokens.get("Macros"),
            cloneToken(tokens.get("-")),
            cloneToken("Token_YAML", {
              POP_MODE: true,
            }),
            tokens.get(","),
            cloneToken("(", {
              LONGER_ALT: [],
            }),
            tokens.get(")"),
            tokens.get(":"),
            cloneToken("=", {
              PUSH_MODE: "inlineExpr",
              LONGER_ALT: [],
            }),
            tokens.get("ID"),
            tokens.get("ESC"),
            tokens.get("OTHER"),
          ]),
          character: cloneTokens(tokens, ({ cloneToken }) => [
            cloneToken("EOL", {
              POP_MODE: true,
            }),
            tokens.get("WS"),
            tokens.get("ML_COMMENT"),
            tokens.get("SL_COMMENT"),
            tokens.get(","),
            tokens.get("("),
            tokens.get(")"),
            cloneToken("CallStart", {
              PUSH_MODE: "macro",
            }),
            tokens.get("ID"),
            tokens.get("ESC"),
            tokens.get("OTHER"),
          ]),
          template: cloneTokens(tokens, ({ cloneToken }) =>
            buildTokens.map((token) => {
              if (token.name === "(") {
                return cloneToken(token, { PUSH_MODE: "expression" });
              }
              if (token.name === "}}") {
                return cloneToken(token, { POP_MODE: true });
              }
              if (token.name === "WS") {
                return cloneToken(token, { GROUP: "hidden" });
              }
              return token;
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
              return token;
            })
          ),
          label: cloneTokens(tokens, ({ cloneToken }) =>
            buildTokens.map((token) => {
              if (token.name === "(") {
                return cloneToken(token, { PUSH_MODE: "expression" });
              }
              if (token.name === ")") {
                return cloneToken(token, { POP_MODE: true });
              }
              return token;
            })
          ),
          pipe: cloneTokens(tokens, ({ cloneToken }) =>
            buildTokens.map((token) => {
              if (token.name === "(") {
                return cloneToken(token, { PUSH_MODE: "expression" });
              }
              if (token.name === "]" || token.name === ")" || token.name === "EOL") {
                return cloneToken(token, { POP_MODE: true });
              }
              if (token.name === "WS") {
                return cloneToken(token, { GROUP: "hidden" });
              }
              return token;
            })
          ),
          inlineExpr: cloneTokens(tokens, ({ cloneToken }) =>
            buildTokens.map((token) => {
              if (token.name === "(") {
                return cloneToken(token, { PUSH_MODE: "expression" });
              }
              if (token.name === "WS" || token.name === "EOL") {
                return cloneToken(token, { POP_MODE: true });
              }
              return token;
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
              if (token.name === "WS") {
                return cloneToken(token, { GROUP: "hidden" });
              }
              return token;
            })
          ),
        },
        defaultMode: "process",
      },
      { skipValidations: true }
    );
  }
}

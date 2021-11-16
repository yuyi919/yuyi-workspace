import { Grammar, Matcher, Node, Semantics as MatchSemantics } from "ohm-js";
import { IIncrementRange } from "..";
import { InternalRange } from "./actions/_util";
import { DocumentLine, SourceNode } from "./interface";
import type { IParseoutput, IScreenProperties } from "./parser/index";
import { Semantics } from "./parser";

function wrapInternalRange(range: InternalRange): any {
  const { colNum, lineNum, offset } = range;
  return Object.setPrototypeOf({ colNum, lineNum, offset }, range);
}

export class ParserContext implements IParseoutput {
  statements: DocumentLine[];
  scriptHtml: string;
  titleHtml: string;
  title_page: any[];
  tokens: any[];
  tokenLines: { [line: number]: number };
  lengthAction: number;
  lengthDialogue: number;
  parseTime: number;
  properties: IScreenProperties;
  inlayHintTokens: {
    text: string;
    source: SourceNode;
    mode: "pre" | "post";
    offsetCol?: number;
  }[] = [];

  public flush() {
    this.init();
    return this;
  }
  public init() {
    this.title_page = [];
    this.tokens = [];
    this.scriptHtml = "";
    this.titleHtml = "";
    this.lengthAction = 0;
    this.lengthDialogue = 0;
    this.tokenLines = {};
    this.parseTime = +new Date();
    this.properties = {
      sceneLines: [],
      scenes: [],
      sceneNames: [],
      titleKeys: [],
      firstTokenLine: Infinity,
      fontLine: -1,
      lengthAction: 0,
      lengthDialogue: 0,
      characters: new Map<string, number[]>(),
      structure: [],
    };

    this.inlayHintTokens = [];
  }

  addInlayHint(text: string, mode: "pre" | "post", source: SourceNode, offsetCol?: number) {
    this.inlayHintTokens.push({ text, mode, source, offsetCol });
  }

  constructor(public grammar: Grammar, public matcher = grammar.matcher()) {
    this.init();
    this.register();
  }

  mark(
    startIdx: number,
    endIdx: number,
    range: InternalRange,
    range2: InternalRange,
    className: string
  ) {
    console.log(
      "mark",
      startIdx,
      endIdx,
      wrapInternalRange(range),
      wrapInternalRange(range2),
      className
    );
    // const startPos = doc.posFromIndex(startIdx);
    // const endPos = doc.posFromIndex(endIdx);
    // const marke = doc.markText(startPos, endPos, { className: 'sh_' + className });
  }
  parse(source: string): DocumentLine[] {
    this.matcher.setInput(source);
    // const tokens = this.getSemanticsResult(
    //   Semantics,
    //   this.matcher,
    //   (node) => node.syntaxHighlight(),
    //   "tokens"
    // );
    return this.parseWith(this.matcher);
  }
  increment(source: string, ranges: IIncrementRange | IIncrementRange[]): DocumentLine[] {
    for (const range of ranges instanceof Array ? ranges : [ranges]) {
      // console.log(matcher.getInput().slice(range.startIdx, range.endIdx), "=>", range.content)
      this.matcher.replaceInputRange(range.startIdx, range.endIdx, range.content);
      // console.log(matcher.getInput())
    }
    // const tokens = this.getSemanticsResult(
    //   Semantics,
    //   this.matcher,
    //   (node) => node.syntaxHighlight(),
    //   "tokens"
    // );

    // matcher = matcher.replaceInputRange(0, matcher.getInput().length, source)
    return this.parseWith(this.matcher);
  }
  register() {
    const context = this;
    Semantics.addAttribute("parserContext", {
      _terminal() {
        return context;
      },
      _iter(...children) {
        return context;
      },
      _nonterminal(...children) {
        return context;
      },
    });
    this.registerHighlight();
  }

  registerHighlight() {
    const context = this;
    Semantics.addOperation("syntaxHighlight", {
      tokens(children) {
        children.syntaxHighlight();
      },

      token(children) {
        if (this.numChildren !== 1) {
          throw new Error("token cst nodes should only have one child");
        }
        this.child(0).syntaxHighlight();
      },

      valueToken(t) {
        return t.syntaxHighlight();
      },

      // instVarAccess(_dot, _spaces, name) {
      //   mark(name.source.startIdx, name.source.endIdx, "instVarName");
      // },
      // javaStyleSelector(_dot, _spaces1, selector, _spaces2, _open) {
      //   mark(selector.source.startIdx, selector.source.endIdx, "selector");
      // },
      // kwSelectorPrefix(prefix, _spaces, _receiverToken) {
      //   mark(prefix.source.startIdx, prefix.source.endIdx, "selector");
      // },
      // kwSelectorPart(selector, colon) {
      //   mark(selector.source.startIdx, colon.source.endIdx, "selector");
      // },
      _iter(...children) {
        return children.map((child) => child.syntaxHighlight());
      },
      _nonterminal(...children) {
        if (this.ctorName !== "any") {
          context.mark(
            this.source.startIdx,
            this.source.endIdx,
            this.source.getLineAndColumn(),
            this.source.collapsedRight().getLineAndColumn(),
            this.ctorName
          );
        }
      },
    });
  }
  parseWith(matcher: Matcher): DocumentLine[] {
    this.flush();
    return this.getSemanticsResult(
      Semantics,
      matcher,
      (node) => (this.statements = node.parse() as DocumentLine[]),
      "main"
    );
  }

  getSemanticsResult<T>(
    semantics: MatchSemantics,
    matcher: Matcher | string,
    wrap: (node: Node) => T,
    ruleName?: string
  ): T {
    const result = this.matchWith(matcher, ruleName);
    if (result.succeeded()) {
      const cst = semantics(result);
      // console.log("matcher", result, cst);
      console.log(cst);
      return wrap(cst as Node);
    } else {
      throw Error(result.message);
    }
  }

  matchWith(matcher: string | Matcher, ruleName?: string) {
    return typeof matcher === "string"
      ? this.grammar.match(matcher, ruleName)
      : matcher.match(ruleName);
  }
}

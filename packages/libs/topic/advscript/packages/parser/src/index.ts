import { ScriptVM } from "./lib";
import { createParser } from "./lib/parser";
import { DocumentLine } from "./lib/interface";
import { ParserContext } from "./lib/ParserContext";
export interface IIncrementRange {
  startIdx: number;
  endIdx: number;
  content: string;
}
export class AdvScript {
  loader: ScriptVM;
  parser: ParserContext;

  constructor(private onGlobalChanged?: any) {
    this.loader = new ScriptVM(this.onGlobalChanged);
  }

  public load(id: string, source: TemplateStringsArray | string, range?: IIncrementRange[]) {
    this.parser = createParser(id);
    const statments = this.parseLines(source, range);
    console.time("[Story] compile");
    this.loader.exec(statments);
    console.timeEnd("[Story] compile");
    return this;
  }

  protected [Symbol.iterator]() {
    return this.loader.createGenerator();
  }

  parseLines(source: string | TemplateStringsArray, range?: IIncrementRange[]) {
    let result: DocumentLine[];
    const text = typeof source === "string" ? source : source[0];
    if (!range) {
      console.time("[Story] parse");
      result = this.parser.parse(text);
      console.timeEnd("[Story] parse");
    } else {
      console.time("[Story] incrementParse");
      result = this.parser.increment(text, range);
      console.timeEnd("[Story] incrementParse");
    }
    return result;
  }
}

import { debounce } from "lodash";
import { AdvScript, IIncrementRange, ContentKind } from "@yuyi919/advscript-parser";
import { monaco } from "../monaco.export";

export class ParserAdapter {
  constructor(public editor: monaco.editor.IStandaloneCodeEditor) {
    this.parse = debounce(this._parse, 200, { maxWait: 10, trailing: true, leading: true });
  }
  public changes = [] as monaco.editor.IModelContentChange[];
  story = new AdvScript();
  private prevText: string;
  parsedDocument(id: string, file: string, range?: IIncrementRange[]) {
    console.log(parser.parse(file, {}, true));
    this.story.load(id, file, range);
    console.time("[Story] run");
    // const lines = [...story];
    for (const line of this.story) {
      // console.log(line)
      if (line.kind === ContentKind.Line) {
        console.debug("call %s", line.command, ...(line.argumentList || []));
      } else {
        console.debug(line);
      }
    }
    console.timeEnd("[Story] run");
    // console.log(lines);
  }
  _parse(text: string) {
    const changed = this.changes.splice(0, this.changes.length);
    if (!this.prevText) {
      this.prevText = text;
      return this.parsedDocument(this.editor.getModel().id, text);
    } else if (this.prevText !== text) {
      const ranges = changed.map((changed) => {
        return {
          startIdx: changed.rangeOffset,
          endIdx: changed.rangeOffset + changed.rangeLength,
          range: changed.range,
          content: changed.text,
        };
      });
      this.prevText = text;
      return this.parsedDocument(this.editor.getModel().id, text, ranges);
    }
  }

  parse!: (text: string) => void;

  handleOnContentChange(
    changes: monaco.editor.IModelContentChange[],
    content: string | string[] = this.editor.getValue()
  ) {
    this.changes.push(...changes);
    this.parse(content instanceof Array ? content.join("\n") : content);
  }
}

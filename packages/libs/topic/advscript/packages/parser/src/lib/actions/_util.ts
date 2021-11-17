import type { Node, Interval } from "ohm-js";
import { padStart } from "lodash";
import { assignSourceNode, Source, SourceFileNode, SourceNode, SourceRange } from "../interface";
import { printError } from "../util";
import { ParserContext } from "../ParserContext";
export interface InternalRange {
  colNum: number;
  line: string;
  lineNum: number;
  nextLine: any;
  offset: number;
  prevLine: any;
  toString(...range: [startIdx: number, endIdx: number][]): string;
}
declare module "ohm-js" {
  interface Interval {
    /**
     * 内部方法，返回
     * @internal
     */
    getLineAndColumn(): InternalRange;
  }
}
function padNumbersToEqualLength(arr) {
  let maxLen = 0;
  const strings = arr.map((n) => {
    const str = n.toString();
    maxLen = Math.max(maxLen, str.length);
    return str;
  });
  return strings.map((s) => padStart(s, maxLen));
}
// Produce a new string that would be the result of copying the contents
// of the string `src` onto `dest` at offset `offest`.
function strcpy(dest, src, offset) {
  const origDestLen = dest.length;
  const start = dest.slice(0, offset);
  const end = dest.slice(offset + src.length);
  // console.log({
  //   dest,
  //   src,
  //   offset,
  //   start,
  //   end,
  //   origDestLen,
  // });
  return (start + src + end).substr(0, origDestLen);
}
export function getStrLenghtWith(str: string, start: number, end: number) {
  str = str.slice(start, end);
  // console.log(str, getRealLength(str));
  return getRealLength(str);
}
export function lineAndColumnToMessage(
  lineAndCol: InternalRange,
  ...ranges: [startIdx: number, endIdx: number][]
) {
  const offset = lineAndCol.offset;
  const lineStr = lineAndCol.line;
  const repeatStr = (str: string, repeat: number) => str.repeat(repeat);

  let text = "Line " + lineAndCol.lineNum + ", col " + lineAndCol.colNum + ":\n";

  // An array of the previous, current, and next line numbers as strings of equal length.
  const lineNumbers = padNumbersToEqualLength([
    lineAndCol.prevLine == null ? 0 : lineAndCol.lineNum - 1,
    lineAndCol.lineNum,
    lineAndCol.nextLine == null ? 0 : lineAndCol.lineNum + 1,
  ]);

  // Helper for appending formatting input lines to the buffer.
  const appendLine = (num, content, prefix) => {
    text += prefix + lineNumbers[num] + " | " + content + "\n";
  };

  // Include the previous line for context if possible.
  if (lineAndCol.prevLine != null) {
    appendLine(0, lineAndCol.prevLine, "  ");
  }
  // Line that the error occurred on.
  appendLine(1, lineAndCol.line, "> ");

  // Build up the line that points to the offset and possible indicates one or more ranges.
  // Start with a blank line, and indicate each range by overlaying a string of `~` chars.
  const lineLen = getRealLength(lineAndCol.line);
  const colLength = lineAndCol.colNum - 1;
  let indicationLine = " ".repeat(lineLen + 1); // Array(lineLen + 1).fill(true).map((_, i) => (i+1)%10).join("");
  for (let i = 0; i < ranges.length; ++i) {
    let [startIdx, endIdx] = ranges[i];
    console.assert(startIdx >= 0 && startIdx <= endIdx, "range start must be >= 0 and <= end");

    const lineStartOffset = offset - colLength;
    startIdx = Math.max(0, startIdx - lineStartOffset);
    endIdx = Math.min(endIdx - lineStartOffset, lineLen);
    // console.log(
    //   { lineStartOffset, startIdx, endIdx },
    //   endIdx - startIdx,
    //   lineStr.slice(startIdx, endIdx)
    // );
    indicationLine = strcpy(
      indicationLine,
      repeatStr("~", getStrLenghtWith(lineStr, startIdx, endIdx)),
      getStrLenghtWith(lineStr, 0, startIdx)
    );
  }
  const gutterWidth = 2 + lineNumbers[1].length + 3;
  text += repeatStr(" ", gutterWidth);
  indicationLine = strcpy(indicationLine, "^", getStrLenghtWith(lineStr, 0, colLength));
  text += indicationLine.replace(/ +$/, "") + "\n";

  // Include the next line for context if possible.
  if (lineAndCol.nextLine != null) {
    appendLine(2, lineAndCol.nextLine, "  ");
  }
  return text;
}
export function createNodeErrorString(node: Node) {
  const { source } = node;
  // console.log(source.getLineAndColumn(), [source.startIdx, source.endIdx]);
  return lineAndColumnToMessage(source.getLineAndColumn(), [source.startIdx, source.endIdx]);
}
export function createNodeError(message: string, node: Node) {
  return Error(createNodeErrorString(node) + "\n" + message);
}

export function commandToString(textspec: Node[]): string {
  return textspec.map((o, i) => o.sourceString + (i > 0 ? " " : "")).join("");
}

class _SourceNode implements SourceNode {
  context: ParserContext;
  sourceFile: SourceFileNode;
  _internalRange: { start: InternalRange; end: InternalRange };
  ctorName: string;
  constructor(textspec: Node[]) {
    const start = textspec[0];
    const end = textspec[textspec.length - 1] || start;
    const sourceFile = {
      sourceString: (start.source as SourceFileNode).sourceString,
      startIdx: start.source.startIdx,
      endIdx: end.source.endIdx,
    } as SourceFileNode;
    this.sourceFile = sourceFile;
    this._internalRange = {
      start: start.source.getLineAndColumn(),
      end: end.source.collapsedRight().getLineAndColumn(),
    };
    this.ctorName = textspec.map((d) => d.ctorName).join(" + ");
    this.context = start.parserContext;
    // if (this.range.line > this.range.lineEnd + 1) {
    //   this.context.output.properties.structure.push({
    //     range: {
    //       line
    //     }
    //   })
    // }
  }
  get range() {
    const { start, end } = this._internalRange;
    const { lineNum: line, colNum: col } = start;
    const { lineNum: lineEnd, colNum: colEnd } = end;
    return {
      line,
      col,
      lineEnd,
      colEnd,
    };
  }

  get sourceString() {
    const { sourceString, startIdx, endIdx } = this.sourceFile;
    return sourceString.slice(startIdx, endIdx);
  }

  get printError() {
    const { startIdx, endIdx } = this.sourceFile;
    return printError(Error(lineAndColumnToMessage(this._internalRange.start, [startIdx, endIdx])));
  }
}

export function toSource(...nodes: Node[]): SourceNode {
  return new _SourceNode(nodes.filter(Boolean));
  // const start = nodes[0];
  // const end = nodes[nodes.length - 1] || start;
  // const sourceFile = {
  //   sourceString: (start.source as SourceFileNode).sourceString,
  //   startIdx: start.source.startIdx,
  //   endIdx: end.source.endIdx,
  // } as SourceFileNode;
  // const _internalRange = {
  //   start: start.source.getLineAndColumn(),
  //   end: end.source.getLineAndColumn(),
  // };
  // return Object.setPrototypeOf(
  //   {
  //     get sourceString() {
  //       return sourceFile.sourceString.slice(sourceFile.startIdx, sourceFile.endIdx);
  //     },
  //     sourceFile,
  //     get range() {
  //       const { start, end } = this._internalRange;
  //       const { lineNum: line, colNum: col } = start;
  //       const { lineNum: lineEnd, colNum: colEnd } = end;
  //       return {
  //         line,
  //         col,
  //         lineEnd,
  //         colEnd,
  //       };
  //     },
  //     _internalRange,
  //     get printError() {
  //       return printError(
  //         Error(
  //           lineAndColumnToMessage(this._internalRange[0], [sourceFile.startIdx, sourceFile.endIdx])
  //         )
  //       );
  //     },
  //     ctorName: nodes.map((d) => d.ctorName).join(" + "),
  //   } as SourceNode,
  //   {
  //     // get children() {
  //     //   return textspec.map(t => t.source.trimmed())
  //     // },
  //     context: start.parserContext,
  //   }
  // );
}

export function toSourceString(...textspec: Node[]): string {
  return textspec.map((o) => o.sourceString).join("");
}
/**
 * 获得字符串实际长度，中文占2，英文占1
 * @param str 字符串
 */
export function getRealLength(str: string, firstOffset = 0) {
  let realLength = 0;
  const len = str.length;
  let charCode = -1;
  let matched = false;
  for (let i = 0; i < len; i++) {
    charCode = str.charCodeAt(i);
    if (charCode >= 0 && charCode <= 128) {
      realLength += 1;
    } else {
      realLength += 2;
      if (!matched) {
        realLength += firstOffset;
        matched = true;
      }
    }
  }
  return realLength;
}
export function assignNode<T, A>(data: T, append: A, updateSource?: Source): T & A {
  if (!data) return append as T & A;
  // console.log(awesome.parse());
  const proterties = Object.getOwnPropertyDescriptors(data);
  const result = {};
  if (updateSource) {
    assignSourceNode(result as any, updateSource);
  } else {
    const proto = Object.getPrototypeOf(data);
    Object.setPrototypeOf(result, proto);
  }
  return Object.defineProperties(result, {
    ...proterties,
    ...Object.getOwnPropertyDescriptors(append),
  });
}

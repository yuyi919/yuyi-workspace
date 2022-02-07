import { AdvScriptServices } from "../advscript-module";
import * as _utils from "../_utils";
import * as langium from "langium";
import type { LspTypes } from "../_lsp";
import * as ast from "../ast-utils";

export class DocumentFormattingEdits {
  constructor(public service: AdvScriptServices) {}

  async formattingTextEdits(
    document: langium.LangiumDocument,
    params: LspTypes.DocumentFormattingParams &
      Partial<LspTypes.DocumentOnTypeFormattingParams> &
      Partial<LspTypes.DocumentRangeFormattingParams>
  ) {
    console.log("formatting", params);
    const result = new Map<langium.CstNode, LspTypes.TextEdit>();
    for (const node of this._gen(document, params)) {
      if (result.has(node)) continue;
      const tokenTypeName = _utils.getNodeTypeName(node);
      if (tokenTypeName === ast.Space || tokenTypeName === ast.WS) {
        const next = _utils.findNextTokenNode(node);
        if (_utils.checkNodeTypeName(next, ast.EOL)) {
          result.set(node, {
            newText: "",
            range: node.range,
          });
          continue;
        }
      }
      if (
        (tokenTypeName === ast.Space && node.text.length > 1) ||
        (tokenTypeName === ast.WS && node.hidden && node.text.length > 1)
      ) {
        result.set(node, {
          newText: " ",
          range: node.range,
        });
        continue;
      }
      if (tokenTypeName === ast.EOL && node.length > 2) {
        const next = node.text.replace(/^ +((\r?\n){1,2})((\r?\n)*)$/, "$1");
        if (next !== node.text) {
          const { start } = node.range;
          result.set(node, {
            newText: next,
            range: {
              start,
              end: {
                line: start.line + [...node.text.matchAll(/\r?\n/g)].length,
                character: 0,
              },
            },
          });
        }
        continue;
      }
      if (ast.isKeyword(node.feature) && tokenTypeName === "Token_ListItem") {
        let next = node.text;
        if (
          !_utils.checkNodeTypeName(_utils.findNextTokenNode(node), {
            [ast.WS]: true,
            [ast.Space]: true,
          })
        ) {
          next += " ";
        }
        if (
          !_utils.checkNodeTypeName(_utils.findPrevTokenNode(node), {
            [ast.WS]: true,
            [ast.Space]: true,
          })
        ) {
          next = " " + next;
        }
        if (next !== node.text) {
          result.set(node, {
            newText: next,
            range: node.range,
          });
          continue;
        }
      }
      if (tokenTypeName === ast.HIDDEN_INDENT) {
        const next = node.payload.currIndentLevel;
        if (next > node.payload.prevIndentLevel) {
          result.set(node, {
            newText: node.text + " ".repeat(next - node.payload.prevIndentLevel),
            range: node.range,
          });
          continue;
        }
      }
      const feature = node.feature;
      console.log(`(${_utils.getNodeTypeName(node)})` + node.text);
    }
    return [...result.values()];
  }

  _gen(
    document: langium.LangiumDocument,
    params: LspTypes.DocumentFormattingParams &
      Partial<LspTypes.DocumentOnTypeFormattingParams> &
      Partial<LspTypes.DocumentRangeFormattingParams>
  ) {
    const cst = document.parseResult.value?.$cstNode;
    if (params.range) {
      const start = document.textDocument.offsetAt(params.range.start);
      const end = document.textDocument.offsetAt(params.range.end);
      return _utils.filterTokenNodeRange(cst, start, end);
    }
    return _utils.findCstGen(cst);
  }
}

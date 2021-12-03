/* eslint-disable prefer-const */
import {
  CstNode,
  isCrossReference,
  isLinkingError,
  isRuleCall,
  LangiumDocument,
  MaybePromise,
  RuleCall,
} from "langium";
import type * as Lsp from "vscode-languageserver-protocol";
import { AdvscriptServices } from "../advscript-module";
import * as ast from "../ast";
import { enum2Array, flattenCstGen, isCompositeCstNode } from "../_utils";

enum TTokenTypes {
  "comment",
  "keyword.control",
  "keyword.operator",
  "regexp",
  "meta.brace.round",
  "entity.name.function",
  "entity.name.type",
  "entity.name.tag",
  "storage.type.property",
  "support.variable.property",
  "constant.property",
  "constant.boolean",
  "constant.numeric",
  "string",
  "markup.raw",
  "token",
}
enum TTokenModifiers {
  "ts",
}
// const a = true
const TOKEN_LEGEND = Object.freeze({
  tokenTypes: TTokenTypes,
  tokenModifiers: enum2Array(TTokenModifiers),
});

export type TokenTypes = keyof typeof TTokenTypes;
export type TokenModifiers = keyof typeof TTokenModifiers;

// console.log("TOKEN_LEGEND", TOKEN_LEGEND, TTokenTypes, TTokenModifiers);

// const TTokenTypes = toCacheMap(TOKEN_LEGEND.tokenTypes);
// const TTokenModifiers = toCacheMap(TOKEN_LEGEND.tokenModifiers);
export class DocumentSemanticProvider {
  tokenLegend = TOKEN_LEGEND;

  protected getTokenType(key: TokenTypes) {
    return TTokenTypes[key];
  }
  protected getModifierType(key: TokenModifiers) {
    return TTokenModifiers[key];
  }

  constructor(protected readonly services: AdvscriptServices) {}

  getDocumentSemanticTokens(
    document: LangiumDocument<ast.Document>,
    range?: Lsp.Range
  ): MaybePromise<Lsp.SemanticTokens> {
    // console.log("doDocumentSemanticTokens", document.uri, range);
    console.time("doDocumentSemanticTokens");
    const data = [] as number[]; //new Int32Array(10000)
    const { value } = document.parseResult || {};
    let prevPos: Lsp.Position,
      current: CstNode,
      match: number | { type: number; modifier: number },
      dataIndex = -1;
    const chunks: [number, number, number, any, any][] = [];
    // const list = value.defines,
    //   length = list.length;
    // let $cstNode: CstNode,
    //   astNodeIndex = -1;
    // while (++astNodeIndex < length) {
    //   $cstNode = list[astNodeIndex].$cstNode;
    //   if (ast.isCharactersDeclare(node) || ast.isMacroDeclare(node) || ast.isOtherDeclare(node)) {
    // console.log(node, [
    //   ...streamCst(node.$cstNode).map((o) => [o.text, findRelevantNode(o), o]),
    // ]);
    const { $cstNode } = value.header;
    for (const cst of flattenCstGen($cstNode)) {
      if (range && $cstNode.range.end.line > range.end.line) break;
      if (isCompositeCstNode(cst)) {
        if (isCrossReference(cst.feature)) {
          current = cst;
          if (isLinkingError(this.services.references.Linker.getCandidateWithCache(cst))) {
            match = this.getTokenType("entity.name.tag");
          } else {
            match = this.kindLegend[ast.Character];
          }
          // console.log("ref", cst.element, cst, cst.text);
        }
      } else {
        if (cst.tokenType.name === "WS" || cst.tokenType.name === "EOL") continue;
        if (ast.isTitlePage(cst.element) && /^Token_/.test(cst.tokenType.name)) {
          // console.log("term token", astNode, leafCst, leafCst.text);
          current = cst;
          match = TTokenTypes["keyword.operator"];
        }
      }
      if (!current) {
        const { element: astNode, parent } = cst;
        const name = isRuleCall(parent.feature) && parent.feature.rule.$refText
        if (name && (/^Token_/.test(name) || /^Operator_/.test(name))) {
          // console.log("token", astNode, leafCst, leafCst.text);
          current = cst;
          match = (parent.feature as RuleCall).rule.ref.fragment
            ? TTokenTypes["meta.brace.round"]
            : ast.isLogicStatment(astNode)
            ? TTokenTypes["keyword.control"]
            : TTokenTypes["keyword.operator"];
        }
        //  else if (isCrossReference(parent.feature)) {
        //   current = cst;
        //   if (isLinkingError(this.services.references.Linker.getCandidateWithCache(parent))) {
        //     match = this.getTokenType("entity.name.tag");
        //   } else {
        //     match = this.kindLegend[ast.Character];
        //   }
        //   console.log("ref.name", astNode, cst, cst.text);
        // } else if (isCrossReference(cst.feature)) {
        //   current = cst;
        //   if (isLinkingError(this.services.references.Linker.getCandidateWithCache(cst.parent))) {
        //     match = this.getTokenType("entity.name.tag");
        //   } else {
        //     match = this.kindLegend[ast.Character];
        //   }
        //   console.log("ref", astNode, cst, cst.text);
        // }
        else if (
          (ast.isIdentifier(astNode) || ast.isNameIdentifier(astNode)) &&
          (ast.isMacro(astNode.$container) ||
            ast.isParam(astNode.$container) ||
            ast.isModifier(astNode.$container) ||
            ast.isCharacter(astNode.$container))
        ) {
          // console.log(astNode.$container.$type, astNode, cst, cst.text);
          current = cst;
          match = this.kindLegend[astNode.$container.$type];
        } else if (
          ast.isDeclareKind(astNode) ||
          ast.isOtherDeclare(astNode) ||
          ast.isTextExpression(astNode) ||
          ast.isLiteralExpression(astNode) ||
          ast.isPlainTextExpression(astNode) ||
          ast.isMacroParam(astNode) ||
          ast.isIdentifier(astNode) ||
          ast.isNameIdentifier(astNode)
        ) {
          current = cst;
          match = this.kindLegend[astNode.$type];
          // console.log(astNode.$type, astNode, leafCst, leafCst.text, match);
        } else {
          // console.log("other", astNode, cst, cst.text);
        }
      }
      if (current) {
        const {
          range: { start },
          length,
        } = cst;
        const { line, character } = start;
        // console.log({ line, character }, prevPos);
        const currentLine = line - (prevPos?.line ?? 0);
        const currentColumn = currentLine === 0 ? character - (prevPos?.character ?? 0) : character;
        const computed = (
          match !== void 0 ? (typeof match === "number" ? { type: match } : match ?? {}) : {}
        ) as Exclude<typeof match, number>;
        const {
          type: tokenType = TTokenTypes["token"],
          modifier: tokenModifier = TTokenModifiers["ts"],
        } = computed;
        // chunks.push([
        //   currentLine,
        //   Math.max(0, currentColumn),
        //   length,
        //   TTokenTypes[tokenType],
        //   TTokenModifiers[tokenModifier],
        // ]);
        data[++dataIndex] = currentLine;
        data[++dataIndex] = Math.max(0, currentColumn);
        data[++dataIndex] = length;
        data[++dataIndex] = tokenType;
        data[++dataIndex] = tokenModifier + 1;
        prevPos = start;
      }
      // }
      //   }
      match = void 0;
      current = void 0;
    }
    // console.log(
    //   "doDocumentSemanticTokens",
    //   [...streamAllContents(document.parseResult?.value)],
    //   defines,
    //   data
    // );
    console.timeEnd("doDocumentSemanticTokens");
    // console.log(
    //   // chunks,
    //   // data,
    //   chunks
    // );
    // console.log([...flatten(value.$cstNode)]);
    return {
      data,
      // : [
      //   [0, 0, 10, 2, -1],
      //   [1, 8, 3, 19, -1],
      //   [0, 5, 4, 19, -1],
      //   [0, 6, 4, 19, -1],
      // ].flat(1),
    };
  }

  kindLegend = {
    [ast.KeyedDeclareKind]: TTokenTypes["keyword.control"],
    [ast.MacrosDeclareKind]: TTokenTypes["keyword.control"],
    [ast.CharactersDeclareKind]: TTokenTypes["keyword.control"],
    [ast.Param]: TTokenTypes["entity.name.tag"],
    [ast.Modifier]: TTokenTypes["entity.name.type"],
    [ast.BooleanLiteral]: TTokenTypes["constant.boolean"],
    [ast.NumberLiteral]: TTokenTypes["constant.numeric"],
    [ast.StringLiteral]: TTokenTypes["string"],
    [ast.TextExpression]: TTokenTypes["markup.raw"],
    [ast.PlainTextExpression]: TTokenTypes["markup.raw"],
    [ast.Character]: TTokenTypes["entity.name.type"],
    [ast.Macro]: TTokenTypes["entity.name.function"],
    [ast.Modifier]: TTokenTypes["constant.property"], // TTokenTypes["storage.type.property"],
    [ast.MacroDeclare]: TTokenTypes["entity.name.function"],
    [ast.NameIdentifier]: TTokenTypes["entity.name.type"],
    [ast.Identifier]: TTokenTypes["entity.name.function"],
  };
}

// export function streamContents(node: AstNode): Stream<AstNodeContent> {
//   type State = { keys: string[]; keyIndex: number; arrayIndex: number };
//   // const arrays = Array.from(
//   //   new Set(
//   //     [...(node.$cstNode as CompositeCstNode).children]
//   //       .map((child) => {
//   //         if (child !== node.$cstNode && child.element !== node) {
//   //           if (isAssignment(child.feature.$container)) {
//   //             return child.feature.$container.feature;
//   //           }
//   //           if (isAssignment(child.feature.$container.$container)) {
//   //             return child.feature.$container.$container.feature;
//   //           }
//   //         }
//   //       })
//   //       .filter(Boolean)
//   //   )
//   // );
//   // console.log(node, arrays);
//   return new StreamImpl<State, AstNodeContent>(
//     () => ({
//       keys: Object.keys(node),
//       keyIndex: 0,
//       arrayIndex: 0,
//     }),
//     (state) => {
//       while (state.keyIndex < state.keys.length) {
//         const property = state.keys[state.keyIndex];
//         if (!property.startsWith("$")) {
//           // eslint-disable-next-line @typescript-eslint/no-explicit-any
//           const value = (node as any)[property];
//           if (isAstNode(value)) {
//             state.keyIndex++;
//             return { done: false, value: { node: value, property } };
//           } else if (Array.isArray(value)) {
//             while (state.arrayIndex < value.length) {
//               const index = state.arrayIndex++;
//               const element = value[index];
//               if (isAstNode(element)) {
//                 return { done: false, value: { node: element, property, index } };
//               }
//             }
//             state.arrayIndex = 0;
//           }
//           //  else {
//           //   state.keyIndex++;
//           //   node.$cstNode;
//           //   return { done: false, value: { node: value, property } };
//           // }
//         }
//         state.keyIndex++;
//       }
//       return DONE_RESULT;
//     }
//   );
// }

// export function streamAllContents(node: AstNode): TreeStream<AstNodeContent> {
//   const root = { node } as AstNodeContent;
//   return new TreeStreamImpl(root, (content) => streamContents(content.node));
// }

import { createKindNodeFactory, DocumentLine, Source } from ".";
import { assignNode } from "../actions/_util";
import { BaseNodeData, NodeTypeKind } from "./base";
import {
  ArgumentList,
  CallExpression,
  CallMacroExpression,
  createCallMacroExpression,
  TemplateExpression,
} from "./Expression";

export enum ContentKind {
  Raw,
  Styled,
  Expr,
  InlineMacro,
  Label,
  Array,
  Line,
  Empty,
}

export const createContent = createKindNodeFactory(NodeTypeKind.Content, ContentKind);

export interface BaseContentNodeData<ContentKind>
  extends BaseNodeData<NodeTypeKind.Content, ContentKind> {
  kindName?: string;
  value?: any;
}
export type ContentLine = MacroContentLine | EmptyContentLine;
export type MacroContentType =
  | "text"
  | "character"
  | "character-action"
  | "action"
  | "transition"
  | "center"
  | "pageBreak"
  | "end";

export interface MacroContentLine extends BaseContentNodeData<ContentKind.Line> {
  argumentList: ArgumentList;
  command?: MacroContentType | (string & {});
  meta?: Pick<CallMacroExpression, "params" | "flags">;
  source?: string;
  pipe?: CallExpression | CallMacroExpression;
}

export interface StatmentArray extends BaseContentNodeData<ContentKind.Array> {
  kind: ContentKind.Array;
  value: DocumentLine[];
}

export interface EmptyContentLine extends BaseContentNodeData<ContentKind.Empty> {
  command?: "empty";
}

export function createContentLine(
  command: MacroContentType | (string & {}),
  argumentList: ArgumentList,
  pipe: CallExpression | CallMacroExpression,
  source?: Source
) {
  return createContent(
    ContentKind.Line,
    {
      command,
      argumentList,
      pipe,
    },
    source
  ) as MacroContentLine;
}
export function createEmptyLine(source?: Source) {
  return createContent(
    ContentKind.Empty,
    {
      command: "empty",
    },
    source
  ) as EmptyContentLine;
}

export interface Raw extends BaseContentNodeData<ContentKind.Raw> {
  value: string;
}

export function createContentRaw(value: string, source: Source) {
  return createContent(ContentKind.Raw, { value }, source) as Raw;
}

export interface StoryMacro extends CallExpression {
  pipe?: CallExpression | CallMacroExpression;
  text?: string;
}

export interface ExprRaw extends BaseContentNodeData<ContentKind.Expr> {
  value: TemplateExpression;
  pipe?: StoryMacro;
}

export interface StyledRaw extends BaseContentNodeData<ContentKind.Styled> {
  value: TemplateRaw[];
  pipe?: CallMacroExpression;
  style?: any;
}

export interface LabelRaw extends BaseContentNodeData<ContentKind.Label> {
  value: string;
  pipe?: StoryMacro;
}
export interface MacroInline extends BaseContentNodeData<ContentKind.InlineMacro> {
  value: string;
  pipe?: StoryMacro;
}

export type TemplateRaw = ExprRaw | StyledRaw | LabelRaw;
export type ContentRaw = Raw | TemplateRaw;

export function createLabelTemplate(
  value: string,
  pipe?: CallMacroExpression | CallExpression,
  source?: Source
): LabelRaw {
  if (source) {
    source.context.addInlayHint("=LABEL", "pre", source, 1);
  }
  return createContent(
    ContentKind.Label,
    { value, pipe: pipe instanceof Object ? assignNode(pipe, { text: value }) : pipe },
    source
  ) as LabelRaw;
}
export function createInlineMacro(
  pipe?: CallMacroExpression | CallExpression,
  source?: Source
): MacroInline {
  if (source) {
    source.context.addInlayHint("=MACRO", "pre", source, 1);
  }
  return createContent(ContentKind.InlineMacro, { pipe }, source) as MacroInline;
}
export function createExprTemplate(value: TemplateExpression, source?: Source): ExprRaw {
  if (source) {
    source.context.addInlayHint("=EXPR", "pre", source, 2);
  }
  return createContent(ContentKind.Expr, { value }, source) as ExprRaw;
}
export function createLines(value: any[], source?: Source) {
  return createContent(ContentKind.Array, { value }, source) as StatmentArray;
}

export function createStyledContent(
  data: ContentRaw[] | StyledRaw,
  pipe?: string,
  source?: Source
) {
  if (!data) return null;
  const isStyled = isStyledContent(data);
  const value = isStyled ? data.value : data;
  return createContent<StyledRaw, ContentKind.Styled>(
    ContentKind.Styled,
    {
      value,
      pipe:
        typeof pipe === "string"
          ? createCallMacroExpression("styled", {
              flags: isStyled && data.pipe ? [...data.pipe.flags, pipe] : [pipe],
            })
          : pipe,
    } as StyledRaw,
    source
  );
}

export function isStatmentArray(data: any): data is StatmentArray {
  return data.type === NodeTypeKind.Content && data.kind === ContentKind.Array;
}

export function isStyledContent(data: any): data is StyledRaw {
  return data.type === NodeTypeKind.Content && data.kind === ContentKind.Styled;
}

export function isLabelTemplate(data: any): data is StyledRaw {
  return data.type === NodeTypeKind.Content && data.kind === ContentKind.Label;
}

export function isExprTemplate(data: any): data is StyledRaw {
  return data.type === NodeTypeKind.Content && data.kind === ContentKind.Expr;
}

import { createExpression, ExpressionNodeData } from ".";
import { Source } from "..";
import { BaseNodeData } from "../base";
import { BaseExpression, ExpressionKind } from "./ExpressionKind";

export type ArgumentList = (ExpressionNodeData | Record<string, any> | string)[];
export interface CallExpression extends BaseExpression {
  kind: ExpressionKind.CallFunction;
  name: string;
  argumentList: ArgumentList;
  meta?: MacroMeta;
}

export interface CallMacroExpression extends BaseExpression, MacroMeta {
  kind: ExpressionKind.CallMacro;
  name: string;
}
export interface MacroMeta {
  flags: string[];
  params: Record<string, any>;
}

export function createMacroParams(params?: Record<string, any>, flags?: string[]): MacroMeta {
  return { params, flags };
}
/**
 * 创建函数调用表达式
 * @param name 名称 默认为<anonymous>
 * @param argumentList 参数，不传时默认为空数组
 * @param source
 */
export function createCallMacroExpression(
  name: string = "<anonymous>",
  params?: Partial<MacroMeta>,
  source?: Source
): CallMacroExpression {
  return createExpression(
    ExpressionKind.CallMacro,
    {
      name,
      params: params?.params || {},
      flags: params?.flags || [],
    } as CallMacroExpression,
    source
  );
}
/**
 * 创建函数调用表达式
 * @param name 名称 默认为<anonymous>
 * @param argumentList 参数，不传时默认为空数组
 * @param source
 */
export function createCallExpression(
  name: string = "<anonymous>",
  argumentList?: ArgumentList,
  source?: Source
): CallExpression {
  return createExpression(
    ExpressionKind.CallFunction,
    {
      argumentList: argumentList || [],
      name,
    },
    source
  );
}

export function createCallExpressionWith(
  data: CallExpression | CallMacroExpression,
  source?: Source
): CallExpression {
  if (isCallExpression(data)) return data;
  const { kind, params, flags, ...other } = data;
  return createExpression(
    ExpressionKind.CallFunction,
    {
      ...other,
      argumentList: [flags.reduce((r, flag) => ({ ...r, [flag]: true }), { ...params })],
      meta: {
        params,
        flags,
      },
    },
    source ?? data.sourceString
  );
}

export function isCallExpression(data: BaseNodeData): data is CallExpression {
  return data.kind === ExpressionKind.CallFunction;
}

declare module "./ExpressionKind" {
  interface BaseExpression {
    pipe?: CallMacroExpression | CallExpression;
  }
}

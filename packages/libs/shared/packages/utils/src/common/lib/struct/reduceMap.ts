/**
 * @module LodashExtraUtils
 */
import { Constant$ } from "@yuyi919/shared-constant";
import { IKeyValueMap } from "@yuyi919/shared-types";
import { List } from "lodash";

export type ReduceMapObjectIterator<
  TSource = any,
  Result = TSource[keyof TSource],
  TResult = {
    [K in keyof TSource]?: Result;
  }
> = (curr: TSource[keyof TSource], key: keyof TSource, source: TSource, prev: TResult) => TResult;

export type ReduceMapListIterator<
  TSource = any,
  Result = any,
  TResult = {
    [key: string]: Result;
  }
> = (curr: TSource, key: number, source: TSource, prev: TResult) => TResult;

/**
 * 近似_.map，callback需返回一个Object，最后将所有返回的Object组合为一个Object
 * @param collection
 * @param callback
 * @param accumulator 基于预先存在的Object
 * @remarks see:  _.reduce
 * @remarks see:  _.map
 */
export function reduceMap<
  T,
  Result extends IKeyValueMap,
  TResult = {
    [K in keyof T]?: Result;
  }
>(
  collection: List<T> | T[] | null | undefined,
  callback: ReduceMapListIterator<T | null | undefined, Result, TResult>,
  accumulator?: TResult
): TResult;

/**
 * @remarks see:  _.reduce
 */
export function reduceMap<
  T extends IKeyValueMap,
  Result = any,
  TResult = {
    [K in keyof T]?: Result;
  }
>(
  collection: T | null | undefined,
  callback: ReduceMapObjectIterator<T, Result, TResult>,
  accumulator?: TResult
): TResult;
export function reduceMap(a: any, b: any, c?: any): any {
  return Constant$.REDUCE(
    a,
    (obj, v, key, list) => Constant$.OBJ_ASSIGN(obj, b(v, key, list, obj)),
    c || {}
  );
}

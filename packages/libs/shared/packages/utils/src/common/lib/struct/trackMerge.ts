/* eslint-disable */
import { Types, IKeyValueMap, TKey } from "@yuyi919/shared-types";
import { Constant$ } from "@yuyi919/shared-constant";
import {
  isArray,
  isNull,
  isPlainObject,
  isUndefined,
  mergeWith,
  MergeWithCustomizer,
  List,
} from "lodash";
import { isFunction } from "../atomic";
import { convertArr2Map } from "./convertArr2Map";
import { pipe } from "./pipe";
// import 'typescript-transform-macros'
import { stubObjectStatic } from "./stub";

const enum Type {
  BASE,
  ARRAY,
  FUNCTION,
  OBJECT,
  NULL,
  UNDEFINED,
  NOTNIL,
  ANY,
}
const enum CustomizerAdapterType {
  BaseWithArr = Type.BASE * 10 + Type.ARRAY, // 替换
  ArrWithBase = Type.ARRAY * 10 + Type.BASE, // 替换
  ArrWithArr = Type.ARRAY * 10 + Type.ARRAY,
  ArrWithObj = Type.ARRAY * 10 + Type.OBJECT, // 替换
  ArrWithFunc = Type.ARRAY * 10 + Type.FUNCTION, // 迭代运算
  ObjWithFunc = Type.OBJECT * 10 + Type.FUNCTION, // 迭代运算
  FuncWithObj = Type.FUNCTION * 10 + Type.OBJECT, // 迭代运算
  FuncWithFunc = Type.FUNCTION * 10 + Type.FUNCTION, // 迭代运算
  ObjWithObj = Type.OBJECT * 10 + Type.OBJECT,
}

const IGRONE = Constant$.EMPTY_OBJECT;
const ReturnIgrone = stubObjectStatic;
const match: [any, any, boolean?][] = [
  [Constant$.IS_ARR, Type.ARRAY],
  [isFunction, Type.FUNCTION],
  [isPlainObject, Type.OBJECT],
  // [expect$.isNil.not, Type.NOTNIL],
  [isNull, Type.NULL],
  [isUndefined, Type.UNDEFINED],
];

function expectTo(value: any, configs: [any, any, boolean?][], elseValue?: any): any {
  var expect: any;
  const r = configs.find((config) => {
    var expectType = config[0];
    return expectType instanceof Function && config[2] !== false
      ? expectType(value)
      : expectType === value;
  });
  return (expect = r && r[1]), expect !== undefined ? expect : elseValue;
}

export function getType(v: any): Type {
  // console.log('mergeFuncPipe', v, expectTo(v, match, Type.BASE))
  return expectTo(v, match, Type.BASE);
}

function isTrackFunc(func: any) {
  // @ts-ignore
  return isFunction(func) && isArray(func.__track);
}
// pipe(v)
export function mergeFuncPipe(funcA: any, funcB: any) {
  var res: any;
  const { __track: current = [funcA], ...otherA } = funcA;
  var { __track: trackB = isFunction(funcB) ? [funcB] : [], ...otherB } = funcB || {};
  const merged = trackMerge(otherA, otherB);
  if (isTrackFunc(funcA)) {
    const __track = current.concat(trackB);
    res = Object.assign(funcA, merged, { __track });
  } else {
    const trackFunction: any = function (arg: any) {
      return Constant$.APPLY(pipe, [arg].concat(trackFunction.__track));
    };
    trackFunction.__track = current.concat(trackB);
    res = Object.assign(trackFunction, merged);
  }
  // console.log('mergeFuncPipe', funcA, funcB, getType(res), merged, Object.keys(merged))
  return res;
}

/**
 * 栈合并
 * @param target
 * @param source
 * @remarks
 * 实现细节见: {@link https://www.lodashjs.com/docs/latest#_mergewithobject-sources-customizer}
 */
export function trackMergePipe<Object, Source>(target: Object, ...source: Source[]): any;
export function trackMergePipe<Object, Source>(target: Object, ...source: any[]): any;
export function trackMergePipe<Object>(__merge: Object) {
  let i = 0,
    length = arguments.length,
    tmp: any,
    result = { __merge } as any;
  while (++i < length) (tmp = arguments[i]) && (result = trackMerge(result, { __merge: tmp }));
  // @ts-ignore
  return result.__merge;
}

export interface TrackMergeOptions {
  ignoreKeys?: string[];
  extendsKeys?: string[];
}
/**
 * 栈合并
 * @param target
 * @param source
 * @remarks
 * 实现细节见: {@link https://www.lodashjs.com/docs/latest#_mergewithobject-sources-customizer}
 */
export function trackMerge<Target, Source>(
  object: Target,
  source: Source,
  options?: TrackMergeOptions
): Partial<Target & Source> {
  if (options) {
    const cacheExtends = convertArr2Map(options.extendsKeys);
    const cacheIgrone = convertArr2Map(options.ignoreKeys);

    return mergeWith(object, source, (value, srcValue, key?, object?, source?) => {
      if (cacheIgrone[key]) return value;

      const adapter =
        cacheExtends[key] && getType(value) !== Type.NULL && getType(value) !== Type.UNDEFINED
          ? TrackAdapter[CustomizerAdapterType.ArrWithArr]
          : useAdapter<Types.Function.Base>(TrackAdapter, getType(value) * 10 + getType(srcValue));

      // console.log(value, srcValue, key, adapter)
      const checked = adapter === ReturnIgrone ? IGRONE : adapter(value, srcValue);
      return checked === IGRONE ? undefined : checked || srcValue;
    });
  }
  return mergeWith(object, source, trackMergeTo);
}
export const trackMergeTo: MergeWithCustomizer = (value, srcValue, key?, object?, source?) => {
  const adapter = useAdapter<Types.Function.Base>(
    TrackAdapter,
    getType(value) * 10 + getType(srcValue)
  );
  // console.log(value, srcValue, key, adapter)
  const checked = adapter === ReturnIgrone ? IGRONE : adapter(value, srcValue);
  return checked === IGRONE ? undefined : checked || srcValue;
};

const TrackAdapter: { [key: string]: MergeWithCustomizer } = {
  [CustomizerAdapterType.BaseWithArr]: Constant$.ARR_CONCAT,
  [CustomizerAdapterType.ArrWithBase]: Constant$.ARR_CONCAT,
  [CustomizerAdapterType.ArrWithArr]: Constant$.ARR_CONCAT,
  [CustomizerAdapterType.FuncWithObj]: mergeFuncPipe,
  [CustomizerAdapterType.FuncWithFunc]: mergeFuncPipe,
  [CustomizerAdapterType.ObjWithFunc]: (obj, func) => mergeFuncPipe(func, obj),
  // [CustomizerAdapterType.ArrWithFunc](value: any[], srcValue: Types.Function.Base<[any[]], any[]>) {
  //   return srcValue(value);
  // },
  // [CustomizerAdapterType.ObjWithObj]: ReturnIgrone
};

export function useAdapter<T = Types.Function.Base>(
  adapter: IKeyValueMap<T>,
  adapterKey: Exclude<TKey, symbol>
) {
  return adapter[adapterKey] || ReturnIgrone;
}

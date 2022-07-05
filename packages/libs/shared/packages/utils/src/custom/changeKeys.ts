import { FOR_EACH } from "../common";
import { OBJ_ASSIGN, FUNCTION, OBJ_KEYS } from "@yuyi919/shared-constant";

/**
 * 移动模式
 * - `ShiftMode.Copy`复制一个`key`的值到另一个`key`的值上
 * - `ShiftMode.cut`表示在移动`key`的值后会`移除`原`key`
 * - `ShiftMode.Auto`表示如果没有明确定义在`shiftKeysMap`中时，自动交换源key与目标key的值
 * @alpha
 */
export const enum ShiftMode {
  /** 自动模式 */
  Auto,
  /** 复制模式 */
  Copy,
  /** 剪切模式 */
  Cut
}

/**
 * @internal
 */
function defaultShifter(key: string, map: object) {
  return key in map ? map[key] : undefined;
}
/**
 *
 * @param obj - 对象
 * @param shiftKeysMap - 替换key与key的映射map
 * @param shiftMode - 移动模式
 * - `ShiftMode.Copy/ShiftMode.cut`表示在移动key的值后会`保留/移除`原key
 * - `ShiftMode.Auto`表示如果没有明确定义在`shiftKeysMap`中时自动交换两个字段
 * @alpha
 */
export function shiftKeyGroup<T, K extends keyof T, Map extends Record<K, K | string>>(
  obj: Record<string | number | K, any>,
  shiftKeysMap: Partial<Map>,
  shiftMode?: ShiftMode
): Record<K, any>;
/**
 *
 * {@inheritDoc (shiftKeyGroup:1)}
 * @alpha
 */
export function shiftKeyGroup<
  T extends Record<any, any>,
  K extends keyof T,
  Map = Record<string | number | K, string | number | K>
>(
  obj: any,
  shiftKeysMap: Map,
  shifter: (key: string, map: Map) => string | false | void | undefined | null
): any;
export function shiftKeyGroup<
  K extends string | number = string,
  Map = Record<string | number | K, string | number | K>
>(obj: any, shiftKeysMap: Map, replacer: Function | ShiftMode = ShiftMode.Auto) {
  obj = OBJ_ASSIGN({}, obj);
  /** 缓存更新字段和值 */
  const replaceValues = {};
  /** 缓存删除字段 */
  const deletedCache = [] as any[];

  /** 缓存的替换器返回结果 */
  let replacerResultKey: number | string | null | undefined | false = null;

  /** 是否使用自定义替换方法 */
  const useCustomReplacer = replacer instanceof FUNCTION;
  const todo: Function = useCustomReplacer ? (replacer as any) : defaultShifter;

  FOR_EACH(OBJ_KEYS(obj), (sourceKey) => {
    /** sourceKey是否是已知键（存在于待替换map中） */
    // const sourceKnwon = (sourceKey in shiftKeysMap)
    replacerResultKey = todo(sourceKey, shiftKeysMap);
    /** 替换目标Key是否是已知键（存在于待替换map中） */
    const replaceKeyInPlan = (replacerResultKey as string) in shiftKeysMap;
    /** 替换目标Key是否是原型对象中的已知键 */
    const replaceKeyInSource = (replacerResultKey as string) in obj;
    // /** 是否是已知键（存在于待替换map中） */
    // const controllingKey = replaceKeyInSource && replaceKeyInPlan
    /** 覆盖值, 如果为true则replacerResultKey必定为不为nil|false */
    const validTarget =
      (replacerResultKey === 0 || !!replacerResultKey) && replacerResultKey !== sourceKey;
    // console.log(replacerResultKey, sourceKey, validTarget)
    /** 1.需要为合法替换对象 2.对象键是存在于原对象中的 3.没有替换计划 */
    const exchange =
      replacer === ShiftMode.Auto && validTarget && replaceKeyInSource && !replaceKeyInPlan;
    if (validTarget) {
      replaceValues[replacerResultKey as string] = obj[sourceKey];
    }
    if (exchange) {
      replaceValues[sourceKey] = obj[replacerResultKey as string];
    } else {
      const deleteOrigin =
        replacerResultKey === false ||
        (useCustomReplacer && validTarget) ||
        // 自动保留时，准备替换的键是否存在于对象中
        (replacer === ShiftMode.Copy
          ? false
          : // 自动删除时，准备替换的键是否存在于对象中
            replacer === ShiftMode.Cut && validTarget && !replaceKeyInPlan);
      if (deleteOrigin) {
        deletedCache[deletedCache.length] = sourceKey;
      }
    }
  });
  // console.log(obj, deletedCache, replaceValues)
  // 删除确定移除的字段
  FOR_EACH(deletedCache, (key) => {
    delete obj[key];
  });
  return OBJ_ASSIGN(obj, replaceValues);
}

/**
 * `交换`一个对象中的两个`key`的`value`
 * @param target -
 * @param sourceKey - 源key
 * @param targetKey - 目标key
 * @alpha
 */
export function shiftKeyTo<T, SK extends keyof T, TK extends keyof T>(
  target: T,
  sourceKey: SK,
  targetKey: TK
): Exchanged<T, SK, TK>;

/**
 * `交换`一个对象中的两个`key`的`value`
 * 或`剪切`/`复制`一个对象的`key`的`value`粘贴到另一个`key`上
 * @param target -
 * @param sourceKey - 源key
 * @param targetKey - 目标key
 * @param mode - 移动模式
 * @alpha
 */
export function shiftKeyTo<T, SK extends keyof T, TK extends keyof T, Mode extends ShiftMode.Auto>(
  target: T,
  sourceKey: SK,
  targetKey: TK,
  mode: Mode
): Exchanged<T, SK, TK>;

/**
 * `交换`一个对象中的两个`key`的`value`
 * 或`剪切`/`复制`一个对象的`key`的`value`粘贴到另一个`key`上
 * @param target -
 * @param sourceKey - 源key
 * @param targetKey - 目标key
 * @param mode - 移动模式
 * @alpha
 */
export function shiftKeyTo<
  T,
  SK extends keyof T,
  TK extends keyof T,
  Mode extends Exclude<ShiftMode, ShiftMode.Auto>
>(target: T, sourceKey: SK, targetKey: TK, mode?: Mode): Shifted<T, SK, TK, Mode>;

export function shiftKeyTo<
  T,
  SK extends keyof T,
  TK extends keyof T,
  Mode extends Exclude<ShiftMode, ShiftMode.Auto>
>(target: T, sourceKey: SK, targetKey: TK, mode?: Mode): Shifted<T, SK, TK, Mode> {
  return shiftKeyGroup(target, { [sourceKey]: targetKey }, mode) as any;
}
/**
 *
 * @alpha
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace shiftKeyTo {
  /**
   *
   * @param target -
   * @param sourceKey -
   * @param targetKey -
   * @returns
   * @alpha
   */
  export function cut<T, SK extends keyof T, TK extends keyof T>(
    target: T,
    sourceKey: SK,
    targetKey: TK
  ): Shifted<T, SK, TK, ShiftMode.Cut> {
    return shiftKeyTo(target, sourceKey, targetKey, ShiftMode.Cut);
  }
  /**
   *
   * @param target -
   * @param sourceKey -
   * @param targetKey -
   * @returns
   * @alpha
   */
  export function copy<T, SK extends keyof T, TK extends keyof T>(
    target: T,
    sourceKey: SK,
    targetKey: TK
  ): Shifted<T, SK, TK, ShiftMode.Copy> {
    return shiftKeyTo(target, sourceKey, targetKey, ShiftMode.Copy);
  }
}

/**
 * 移动/复制了一个对象的key到另一个key
 * @alpha
 */
export type Shifted<
  T,
  SK extends keyof T,
  TK extends keyof T,
  Mode extends Exclude<ShiftMode, ShiftMode.Auto>,
  TargetKeys extends Mode extends ShiftMode.Cut
    ? Exclude<keyof T, SK>
    : keyof T = Mode extends ShiftMode.Cut ? Exclude<keyof T, SK> : keyof T
> = {
  [K in TargetKeys]: T[K extends TK ? SK : K];
};

/**
 * 交换了一个对象的两个key
 * @alpha
 */
export type Exchanged<T, SK extends keyof T, TK extends keyof T> = {
  [K in keyof T]: T[K extends TK ? SK : K extends SK ? TK : K];
};

import { OBJ_CREATE, OBJ_SEAL } from "./lib";

/**
 * 常量`null`
 * @internal
 */
export const NULL = null;
/**
 * 常量`undefined`
 * @internal
 */
export const UNDEFINED = void 0;

/**
 * 静态不可变空对象
 * @example
 * ```ts
 * EMPTY_OBJECT instanceof Object //=> false
 * typeof EMPTY_OBJECT === 'object' //=> true
 * ```
 * @remarks
 * 使用`Object.create(null)`创建，因此使用`instanceof Object`做判断会返回false
 * 想让instanceof正确判断请使用{@link EmptyObject}
 * @public
 */
export const EMPTY_OBJECT: {} = /* @__PURE__ */ OBJ_SEAL(OBJ_CREATE(NULL));

/**
 * 静态不可变空对象
 * @example
 * ```ts
 * EmptyObject instanceof Object
 * // => true
 * typeof EMPTY_OBJECT === 'object'
 * // => true
 * ```
 * @remarks
 * 不同于{@link EMPTY_OBJECT}，`EMPTY_OBJECT instanceof Object`会返回true
 * @public
 */
export const EmptyObject = /* @__PURE__ */ OBJ_SEAL({} as Record<string, any>);
/**
 * 静态不可变空数组
 * @public
 */
export const EmptyArray = /* @__PURE__ */ OBJ_SEAL([]);

export * from "./lib";

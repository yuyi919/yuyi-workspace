import {
  IKeyValueMap,
  IsAny,
  IsArray,
  IsBaseType,
  IsClasses,
  IsObject,
  IsUnknown
} from "@yuyi919/shared-types";
// function filterToExtra<Target>(expect: (target: any) => boolean, ...values: any[]): Target | undefined;
// function filterToExtra<Target>(expect: (target: any) => boolean): Target | void {
//   var i = 0, length = arguments.length, v: any;
//   while (++i < length)
//     if (expect(v = arguments[i])) return v;
//   return;
// }
// export { filterToExtra }
// export type AA = IsArray<any>

/**
 * Filter函数类型生成器
 * @internal
 */
export type FilterGenerator<Target> = <
  Expect extends IsBaseType<
    Target,
    Target,
    IsArray<Target, any, IsObject<Target, any, IsAny<Target, any, Target>>>
  > = any
>(
  ...key: any[]
) =>
  | //
  IsArray<
      Target,
      Array<Expect>,
      IsBaseType<
        Target,
        IsUnknown<Expect, Target, Expect>,
        IsUnknown<
          Target,
          Expect,
          //
          IsObject<
            Target,
            IsClasses<Target, Target, IsBaseType<Expect, IKeyValueMap<Expect>, Expect>>,
            IsUnknown<Expect, Target, Expect>
          >
        >
      >
    >
  | undefined;

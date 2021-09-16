import { getDynamicStyles } from "jss";
import { castArray, defaultsDeep, merge, mergeWith } from "lodash";

function getDynamicStylesWith(styles) {
  const { extend, ...i } = styles;
  return getDynamicStyles(i);
}
function merges(...args) {
  function customizer(value: any, srcValue: any, key: string, object: any, source: any) {
    console.log(value, srcValue, key, object, source)
    if (srcValue === void 0) {
      return value;
    }
  }
  return mergeWith.apply(null, [...args, customizer]);
}
function getDynamicExtends(extend: any): any {
  return extend instanceof Array
    ? extend.reduce(
        // @ts-ignore
        (r, i) => merge(r, getDynamicStylesWith(i)),
        {}
      )
    : extend;
}

export function appendExtends({ extend: sourceExtend, ...styles }: any, extend: any) {
  const dynamicExtends = getDynamicExtends(extend);
  return {
    extend: sourceExtend ? castArray(sourceExtend).concat(castArray(extend)) : extend,
    ...defaultsDeep(styles, dynamicExtends),
  };
}

export function define({ extend, ...styles }: any, factoryArg?: any) {
  const dynamicExtends = extend && getDynamicExtends(extend);
  return {
    extend: merges(...extend),
    ...defaultsDeep(styles, dynamicExtends),
  };
}

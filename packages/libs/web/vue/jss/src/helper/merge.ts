import { getDynamicStyles } from "jss";
import { castArray, defaultsDeep, merge, mergeWith } from "lodash";

const button0 = {
  padding: "20px",
  background: "blue",
};
const getBack = {
  background: (data) => {
    return data.background;
  },
};
const redButton = define({
  padding: "10px",
  extend: [
    {
      padding: "5px",
    },
    getBack,
  ],
});
const extend = [button0, redButton];
const styles = {
  button0,
  button1: appendExtends(
    {
      // padding: "20px",
      // background: () => "white"
    },
    extend
  ),
};
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

console.log(styles);

export default styles;

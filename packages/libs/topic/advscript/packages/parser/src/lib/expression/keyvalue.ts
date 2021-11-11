import { defineExpressionActions, Node } from "../interface";
import { ExpressionNode } from "./Expression";

export const Keyvalue = defineExpressionActions<any>({
  Params_multiple(kv, c, content) {
    const ret = {
      type: "Params",
      flags: [],
      params: {},
    };
    const result = kv.parse().value;
    // console.log(result);
    if (result.length === 1) {
      ret.flags.push(result[0]);
    } else {
      ret.params[result[0]] = result[1];
    }
    const ret2 = content.parse();
    ret.flags = ret.flags.concat(ret2.flags);
    Object.assign(ret.params, ret2.params);
    return ret;
  },
  Params_single(kv, end) {
    const ret = {
      type: "Params",
      flags: [],
      params: {},
    };
    const result = kv.parse().value;
    // console.log(result);
    if (result.length === 1) {
      ret.flags.push(result[0]);
    } else {
      ret.params[result[0]] = result[1];
    }
    return ret;
  },
  Param_setValue(key, syntex, value) {
    return {
      type: "NodeArray",
      value: [key.parse(), value.parse()] as [Node<string>, ExpressionNode],
    };
  },
  Param_setFlag(key) {
    return {
      type: "NodeArray",
      value: [key.parse()] as [Node<string>],
    };
  },
});

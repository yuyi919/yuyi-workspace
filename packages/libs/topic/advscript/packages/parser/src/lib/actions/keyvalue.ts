import { defineActions, Node } from "../interface";
import { ExpressionNode } from "./Expression";

export const Keyvalue = defineActions({
  Content_mul(kv, space, content) {
    const ret = {
      flags: [],
      params: {},
    };
    const result = kv.parse();
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
  Content_base(kv) {
    const ret = {
      flags: [],
      params: {},
    };
    const result = kv.parse();
    if (result.length === 1) {
      ret.flags.push(result[0]);
    } else {
      ret.params[result[0]] = result[1];
    }
    return ret;
  },
  KeyValue_param(key, syntex, value): [Node<string>, ExpressionNode] {
    return [key.parse(), value.parse()];
  },
  KeyValue_flag(key): [Node<string>] {
    return [key.parse()];
  },
});

import type { CSSProperties } from "@yuyi919/shared-types";
import type { VNode } from "vue";
import { PropType } from "vue-demi";
import type { VueTypeDef, VueTypesInterface, VueTypeValidableDef } from "vue-types";
import { createTypes } from "vue-types";
const PropTypes = createTypes({
  func: void 0,
  bool: void 0,
  string: void 0,
  number: void 0,
  array: void 0,
  object: void 0,
  integer: void 0
});

PropTypes.extend([
  {
    name: "shapeSize",
    getter: true,
    type: [String, Number],
    default: void 0
  },
  {
    name: "looseBool",
    getter: true,
    type: Boolean,
    default: void 0
  },
  {
    name: "style",
    getter: true,
    type: [String, Object],
    default: void 0
  },
  {
    name: "VNodeChild",
    getter: true,
    type: void 0
  }
]);

export function withUndefined<T extends { default?: any }>(type: T): T {
  type.default = void 0;
  return type;
}

export default PropTypes as VueTypesInterface & {
  readonly shapeSize: VueTypeValidableDef<`${number}${string}` | number>;
  readonly looseBool: VueTypeValidableDef<boolean>;
  readonly style: VueTypeValidableDef<CSSProperties>;
  readonly VNodeChild: VueTypeValidableDef<VNode>;
};

export const initDefaultProps = <T>(
  types: T,
  defaultProps: {
    [K in keyof T]?: T[K] extends VueTypeValidableDef<infer U>
      ? U
      : T[K] extends VueTypeDef<infer U>
      ? U
      : T[K] extends { type: PropType<infer U> }
      ? U
      : any;
  }
): T => {
  const propTypes: T = {} as T;
  // eslint-disable-next-line guard-for-in
  for (const k in types) {
    const prop = types[k] as unknown as VueTypeValidableDef;
    if (prop && k in defaultProps) {
      prop.def ? prop.def(defaultProps[k]) : (prop.default = defaultProps[k]);
    }
    propTypes[k as keyof T] = prop as unknown as T[keyof T];
  }
  return propTypes;
};

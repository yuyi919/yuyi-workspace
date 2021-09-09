/* eslint-disable @typescript-eslint/no-explicit-any */
import Vue, { VNodeChildren, VueConstructor } from "vue";
import { h, isVue2 } from "vue-demi";
import { mergeJsxProps, VNodeData } from "./mergeJsxProps";
export interface ExtendIntrinsicAttributes {
  ["v-slot"]?: string;
  /**
   * 显示传入合并vue-jsx的props(包含attrs,props,on,nativeOn,etc.)
   */
  mergeJsxProps?: VNodeData[];
  class?: VNodeData["class"];
  staticClass?: VNodeData["staticClass"];
  key?: VNodeData["key"];
  ref?: VNodeData["ref"] | { value: unknown };
  slot?: VNodeData["slot"];
  style?: VNodeData["style"] | string;
  domProps?: VNodeData["domProps"];
  attrs?: VNodeData["attrs"];
  hook?: VNodeData["hook"];
  on?: VNodeData["on"];
  nativeOn?: VNodeData["nativeOn"];
  id?: string;
  refInFor?: boolean;
  domPropsInnerHTML?: string;
}
const CLASS_NAME = "class";
const STYLE = "style";
const REF = "ref";
const PROPS = "props";
const MODEL = "model";
const V_MODEL = "vModel";
const ATTRS = "attrs";
const V_SLOT = "v-slot";
const SLOT = "slot";
const CHILDREN = "children";
const SLOTS = "slots";
const SCOPED_SLOTS = "scopedSlots";
const ON = "on";
const NATIVEON = "nativeOn";

type Element = string | VueConstructor<Vue>;
export type Options = { [option: string]: any };

export const getEventNames = (options: Options) =>
  Object.keys(options).filter((option) => option.startsWith("on"));

const mapEventNamesToHandlerPairs = (options: Options, eventNames: string[]) => {
  const r = {};
  for (const eventName of eventNames) {
    if (eventName && options[eventName]) {
      r[eventName.substring(2).toLowerCase()] = options[eventName];
    }
  }
  return r;
};

export const getAttributes = (options: Options, excluded: string[]) => {
  const result = {};
  for (const key in options) {
    if (!excluded.includes(key)) {
      result[key] = options[key];
    }
  }
  return result;
};
// Object.fromEntries(Object.entries(options).filter(([option]) => !excluded.includes(option)));
export const boxSlots = (slots: any) => {
  const result = {};
  if (slots) {
    for (const key in slots) {
      result[key] = () => slots[key];
    }
  }
  return result;
};
export const getJArgumentsWithOptions = (
  element: Element,
  options: Options,
  children: VNodeChildren | VNodeChildren[]
): {
  data: Options;
  children: VNodeChildren[] | VNodeChildren;
} => {
  const eventNames = getEventNames(options);
  const elementIsAComponent = typeof element !== "string";
  const {
    [CLASS_NAME]: className,
    [REF]: ref,
    [STYLE]: style,
    [SCOPED_SLOTS]: scopedSlots,
    [SLOT]: slot,
    [CHILDREN]: _children,
    [SLOTS]: slots,
    [V_SLOT]: vSlot,
    [ON]: on,
    [MODEL]: model,
    [V_MODEL]: vModel = model,
    key,
    mergeJsxProps: _mergeJsxPropsArgs,
    [NATIVEON]: nativeOn,
    [PROPS]: _props,
    [ATTRS]: attrs,
    domPropsInnerHTML: domPropsInnerHTML,
    ...OTHER
  } = options;
  const props = getAttributes(OTHER, eventNames);
  const data = mergeJsxProps(
    {
      [CLASS_NAME]: className,
      [STYLE]: style,
      [REF]: (isVue2 && ref?.name) || ref,
      [SLOT]: vSlot || slot,
      [SCOPED_SLOTS]: scopedSlots,
      [ON]: mapEventNamesToHandlerPairs(options, eventNames),
      [MODEL]: vModel,
      domProps: domPropsInnerHTML && {
        innerHTML: domPropsInnerHTML,
      },
      key,
      [elementIsAComponent ? PROPS : ATTRS]: props,
    },
    { props: _props, attrs, nativeOn, on, scopedSlots: boxSlots(slots) },
    ...(_mergeJsxPropsArgs || [])
  );
  return {
    data,
    children: _children ? [_children, children] : children,
  };
};
export function jsxEsbuild(
  element: Element,
  options: Options | null,
  ...children: VNodeChildren[]
) {
  if (options) {
    const { data, children: renderChildren } = getJArgumentsWithOptions(element, options, children);
    if (element === Fragment) {
      return renderChildren;
    }
    return h(element, data, renderChildren);
  }
  if (element === Fragment) {
    return children;
  }
  return h(element, children);
}

export function jsx(element: Element, props: Options | null, key?: string) {
  if (props) {
    const { children, ...options } = props;
    const { data, children: renderChildren } = getJArgumentsWithOptions(
      element,
      options,
      children || []
    );
    if (element === Fragment) {
      return renderChildren;
    }
    return h(element, data, renderChildren instanceof Array ? renderChildren : [renderChildren]);
  }
  if (element === Fragment) {
    return [];
  }
  return h(element);
}
export const jsxs = jsx;
export const Fragment: Element = Symbol("Fragment") as any;

export * from "./mergeJsxPropsToVNode";
export * from "./VNode";
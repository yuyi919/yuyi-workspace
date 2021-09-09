/* eslint-disable no-redeclare */
/* eslint-disable camelcase */
// @ts-ignore
import { VNode } from "vue";
import { cloneElement } from "./VNode";
import { mergeJsxProps } from "./mergeJsxProps";

export function mergeJsxPropsToVNode(
  vnode: VNode[],
  ...datas: (VNode["data"] & { children?: VNode[] })[]
): VNode[];
export function mergeJsxPropsToVNode(
  vnode: VNode,
  ...datas: (VNode["data"] & { children?: VNode[] })[]
): VNode;
export function mergeJsxPropsToVNode(
  vnode: VNode | VNode[],
  ...datas: (VNode["data"] & { children?: VNode[] })[]
): VNode | VNode[];
export function mergeJsxPropsToVNode(
  vnode: VNode | VNode[],
  ...datas: (VNode["data"] & { children?: VNode[] })[]
): VNode | VNode[] {
  if (vnode instanceof Array) {
    const r = [];
    for (const i of vnode) {
      r[r.length] = mergeJsxPropsToVNode(i, ...datas);
    }
    // @ts-ignore
    return r;
  } else if (vnode) {
    const { on = {}, props = {}, ...otherData } = vnode?.data || {};
    // vnode.data = _mergeJsxProps([
    //   vnode?.data || {},
    //   ...data
    // ]);

    const merged = mergeJsxProps(
      {
        props: {
          ...(vnode.componentOptions?.propsData || props || {}),
        },
        on: {
          ...(getListeners(vnode) || {}),
        },
      },
      otherData,
      ...datas
    );
    vnode = cloneElement(vnode, merged) as VNode;
    if (vnode.componentOptions) {
      const { on: listeners, ...other } = merged;
      vnode.data = other;
    } else {
      vnode.data = merged;
    }
    // console.log(vnode.data)
    // 填补key
    // @ts-ignore
    vnode.key = vnode.key ?? vnode.data.key;
    if (vnode.componentOptions) {
      // const { propsData, listeners } = vnode.componentOptions;
      // @ts-ignore
      // vnode.data.props && propsData && (vnode.componentOptions.propsData = { ...propsData, ...vnode.data.props });
      // // @ts-ignore
      // vnode.data.on && listeners && (vnode.componentOptions.listeners = { ...listeners, ...vnode.data.on });
      for (const d of datas) {
        d.children && (vnode.componentOptions.children = d.children);
      }
    }
  }
  return vnode;
}

function getListeners(vnode: VNode): any {
  const { listeners } = vnode.componentOptions || {};
  if (!listeners) return vnode.data?.on;
  const return_listeners = {};
  for (const key in listeners) {
    return_listeners[key] = listeners[key]?.fns ? listeners[key].fns : listeners[key];
  }
  return return_listeners;
}

export function mergeJsxPropToVNode(vnodes: VNode, key: string, value: any): VNode;
export function mergeJsxPropToVNode(vnodes: VNode[], key: string, value: any): VNode[];
export function mergeJsxPropToVNode(
  vnodes: VNode | VNode[],
  key: string,
  value: any
): VNode | VNode[];
export function mergeJsxPropToVNode(
  vnodes: VNode | VNode[],
  key: string,
  value: any
): VNode | VNode[] {
  return mergeJsxPropsToVNode(vnodes as VNode[], { [key]: value });
}
export default mergeJsxProps;

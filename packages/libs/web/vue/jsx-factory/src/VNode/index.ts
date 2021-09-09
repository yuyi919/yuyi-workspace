/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { filterEmpty, parseStyleText } from "./_built/props-util";
import { cloneVNode } from "./_built/vnode";
import classNames from "classnames";
import { VNode } from "vue";
import { h } from "vue-demi";

export function isVNode(vnode: any): vnode is VNode {
  const VNode = h("div").constructor;
  return vnode instanceof VNode;
}

export function getVNodeVShow(vnode: VNode): boolean {
  const dec = vnode.data.directives.find((o) => o.name === "show");
  return dec ? dec.value : true;
}
export function getChildren(vnode: VNode, defaultValue = [] as VNode["children"]): VNode[] {
  return (
    vnode.componentOptions &&
    (vnode.componentOptions.children ||
      // @ts-ignore
      (vnode.componentOptions.propsData && (vnode.componentOptions.propsData as any).children) ||
      defaultValue)
  );
}
export function setChildren(vnode: VNode, children: VNode | VNode[]) {
  vnode.componentOptions &&
    (vnode.componentOptions.children = children instanceof Array ? children : [children]);
  return vnode;
}

export function hackVnodeChildren(
  vnode: VNode,
  replacer: (child: VNode["children"]) => VNode | VNode[]
) {
  const children = getChildren(vnode);
  return setChildren(vnode, replacer(children));
}

export function cloneElement(n: VNode, nodeProps: any = {}, deep?: boolean) {
  let ele = n;
  if (Array.isArray(n)) {
    ele = filterEmpty(n)[0];
  }
  if (!ele) {
    return null;
  }
  const node = cloneVNode(ele, deep);
  // // 函数式组件不支持clone  https://github.com/vueComponent/ant-design-vue/pull/1947
  // warning(
  //   !(node.fnOptions && node.fnOptions.functional),
  //   `can not use cloneElement for functional component (${node.fnOptions && node.fnOptions.name})`,
  // );
  const { props = {}, key, on = {}, nativeOn = {}, children, directives = [] } = nodeProps;
  const data = node.data || {};
  let cls = {};
  let style = {};
  const {
    attrs = {},
    ref,
    domProps = {},
    style: tempStyle = {},
    class: tempCls = {},
    scopedSlots = {},
  } = nodeProps;

  if (typeof data.style === "string") {
    style = parseStyleText(data.style);
  } else {
    style = { ...data.style, ...style };
  }
  if (typeof tempStyle === "string") {
    style = { ...style, ...parseStyleText(tempStyle) };
  } else {
    style = { ...style, ...tempStyle };
  }

  if (typeof data.class === "string" && data.class.trim() !== "") {
    data.class.split(" ").forEach((c) => {
      cls[c.trim()] = true;
    });
  } else if (Array.isArray(data.class)) {
    classNames(data.class)
      .split(" ")
      .forEach((c) => {
        cls[c.trim()] = true;
      });
  } else {
    cls = { ...data.class, ...cls };
  }
  if (typeof tempCls === "string" && tempCls.trim() !== "") {
    tempCls.split(" ").forEach((c) => {
      cls[c.trim()] = true;
    });
  } else {
    cls = { ...cls, ...tempCls };
  }
  node.data = Object.assign({}, data, {
    style,
    attrs: { ...data.attrs, ...attrs },
    class: cls,
    domProps: { ...data.domProps, ...domProps },
    scopedSlots: { ...data.scopedSlots, ...scopedSlots },
    directives: [...(data.directives || []), ...directives],
  });

  if (node.componentOptions) {
    node.componentOptions.propsData = node.componentOptions.propsData || {};
    node.componentOptions.listeners = node.componentOptions.listeners || {};
    node.componentOptions.propsData = { ...node.componentOptions.propsData, ...props };
    node.componentOptions.listeners = { ...node.componentOptions.listeners, ...on };
    if (children) {
      node.componentOptions.children = children;
    }
  } else {
    if (children) {
      node.children = children;
    }
    node.data.on = { ...(node.data.on || {}), ...on };
  }
  node.data.on = { ...(node.data.on || {}), ...nativeOn };

  if (key !== undefined) {
    node.key = key;
    node.data.key = key;
  }
  if (typeof ref === "string") {
    node.data.ref = ref;
  }
  return node;
}
export {
  getKey as getVNodeKey,
  getOptionProps as getVNodeProps,
} from "./_built/props-util";

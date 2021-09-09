/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { filterEmpty, parseStyleText } from "./_built/props-util";
import { cloneVNode } from "./_built/vnode";
import classNames from "classnames";
import { h } from "vue-demi";
export function isVNode(vnode) {
    const VNode = h("div").constructor;
    return vnode instanceof VNode;
}
export function getVNodeVShow(vnode) {
    const dec = vnode.data.directives.find((o) => o.name === "show");
    return dec ? dec.value : true;
}
export function getChildren(vnode, defaultValue = []) {
    return (vnode.componentOptions &&
        (vnode.componentOptions.children ||
            // @ts-ignore
            (vnode.componentOptions.propsData && vnode.componentOptions.propsData.children) ||
            defaultValue));
}
export function setChildren(vnode, children) {
    vnode.componentOptions &&
        (vnode.componentOptions.children = children instanceof Array ? children : [children]);
    return vnode;
}
export function hackVnodeChildren(vnode, replacer) {
    const children = getChildren(vnode);
    return setChildren(vnode, replacer(children));
}
export function cloneElement(n, nodeProps = {}, deep) {
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
    const { attrs = {}, ref, domProps = {}, style: tempStyle = {}, class: tempCls = {}, scopedSlots = {}, } = nodeProps;
    if (typeof data.style === "string") {
        style = parseStyleText(data.style);
    }
    else {
        style = Object.assign(Object.assign({}, data.style), style);
    }
    if (typeof tempStyle === "string") {
        style = Object.assign(Object.assign({}, style), parseStyleText(tempStyle));
    }
    else {
        style = Object.assign(Object.assign({}, style), tempStyle);
    }
    if (typeof data.class === "string" && data.class.trim() !== "") {
        data.class.split(" ").forEach((c) => {
            cls[c.trim()] = true;
        });
    }
    else if (Array.isArray(data.class)) {
        classNames(data.class)
            .split(" ")
            .forEach((c) => {
            cls[c.trim()] = true;
        });
    }
    else {
        cls = Object.assign(Object.assign({}, data.class), cls);
    }
    if (typeof tempCls === "string" && tempCls.trim() !== "") {
        tempCls.split(" ").forEach((c) => {
            cls[c.trim()] = true;
        });
    }
    else {
        cls = Object.assign(Object.assign({}, cls), tempCls);
    }
    node.data = Object.assign({}, data, {
        style,
        attrs: Object.assign(Object.assign({}, data.attrs), attrs),
        class: cls,
        domProps: Object.assign(Object.assign({}, data.domProps), domProps),
        scopedSlots: Object.assign(Object.assign({}, data.scopedSlots), scopedSlots),
        directives: [...(data.directives || []), ...directives],
    });
    if (node.componentOptions) {
        node.componentOptions.propsData = node.componentOptions.propsData || {};
        node.componentOptions.listeners = node.componentOptions.listeners || {};
        node.componentOptions.propsData = Object.assign(Object.assign({}, node.componentOptions.propsData), props);
        node.componentOptions.listeners = Object.assign(Object.assign({}, node.componentOptions.listeners), on);
        if (children) {
            node.componentOptions.children = children;
        }
    }
    else {
        if (children) {
            node.children = children;
        }
        node.data.on = Object.assign(Object.assign({}, (node.data.on || {})), on);
    }
    node.data.on = Object.assign(Object.assign({}, (node.data.on || {})), nativeOn);
    if (key !== undefined) {
        node.key = key;
        node.data.key = key;
    }
    if (typeof ref === "string") {
        node.data.ref = ref;
    }
    return node;
}
export { getKey as getVNodeKey, getOptionProps as getVNodeProps, } from "./_built/props-util";
//# sourceMappingURL=index.js.map
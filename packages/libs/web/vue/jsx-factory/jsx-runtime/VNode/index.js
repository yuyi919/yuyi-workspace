"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVNodeProps = exports.getVNodeKey = exports.cloneElement = exports.hackVnodeChildren = exports.setChildren = exports.getChildren = exports.getVNodeVShow = exports.isVNode = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
const props_util_1 = require("./_built/props-util");
const vnode_1 = require("./_built/vnode");
const classnames_1 = require("classnames");
const vue_demi_1 = require("vue-demi");
function isVNode(vnode) {
    const VNode = vue_demi_1.h("div").constructor;
    return vnode instanceof VNode;
}
exports.isVNode = isVNode;
function getVNodeVShow(vnode) {
    const dec = vnode.data.directives.find((o) => o.name === "show");
    return dec ? dec.value : true;
}
exports.getVNodeVShow = getVNodeVShow;
function getChildren(vnode, defaultValue = []) {
    return (vnode.componentOptions &&
        (vnode.componentOptions.children ||
            // @ts-ignore
            (vnode.componentOptions.propsData && vnode.componentOptions.propsData.children) ||
            defaultValue));
}
exports.getChildren = getChildren;
function setChildren(vnode, children) {
    vnode.componentOptions &&
        (vnode.componentOptions.children = children instanceof Array ? children : [children]);
    return vnode;
}
exports.setChildren = setChildren;
function hackVnodeChildren(vnode, replacer) {
    const children = getChildren(vnode);
    return setChildren(vnode, replacer(children));
}
exports.hackVnodeChildren = hackVnodeChildren;
function cloneElement(n, nodeProps = {}, deep) {
    let ele = n;
    if (Array.isArray(n)) {
        ele = props_util_1.filterEmpty(n)[0];
    }
    if (!ele) {
        return null;
    }
    const node = vnode_1.cloneVNode(ele, deep);
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
        style = props_util_1.parseStyleText(data.style);
    }
    else {
        style = Object.assign(Object.assign({}, data.style), style);
    }
    if (typeof tempStyle === "string") {
        style = Object.assign(Object.assign({}, style), props_util_1.parseStyleText(tempStyle));
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
        classnames_1.default(data.class)
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
exports.cloneElement = cloneElement;
var props_util_2 = require("./_built/props-util");
Object.defineProperty(exports, "getVNodeKey", { enumerable: true, get: function () { return props_util_2.getKey; } });
Object.defineProperty(exports, "getVNodeProps", { enumerable: true, get: function () { return props_util_2.getOptionProps; } });
//# sourceMappingURL=index.js.map
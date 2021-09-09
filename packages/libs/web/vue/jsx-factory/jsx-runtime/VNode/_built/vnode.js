"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneElement = exports.cloneVNodes = exports.cloneVNode = void 0;
/*eslint-disable*/
// @ts-nocheck
const props_util_1 = require("./props-util");
const classnames_1 = require("classnames");
function cloneVNode(vnode, deep) {
    const componentOptions = vnode.componentOptions;
    const data = vnode.data;
    let listeners = {};
    if (componentOptions && componentOptions.listeners) {
        listeners = Object.assign({}, componentOptions.listeners);
    }
    let on = {};
    if (data && data.on) {
        on = Object.assign({}, data.on);
    }
    const cloned = new vnode.constructor(vnode.tag, data ? Object.assign(Object.assign({}, data), { on }) : data, vnode.children, vnode.text, vnode.elm, vnode.context, componentOptions ? Object.assign(Object.assign({}, componentOptions), { listeners }) : componentOptions, vnode.asyncFactory);
    cloned.ns = vnode.ns;
    cloned.isStatic = vnode.isStatic;
    cloned.key = vnode.key;
    cloned.isComment = vnode.isComment;
    cloned.fnContext = vnode.fnContext;
    cloned.fnOptions = vnode.fnOptions;
    cloned.fnScopeId = vnode.fnScopeId;
    cloned.isCloned = true;
    if (deep) {
        if (vnode.children) {
            cloned.children = cloneVNodes(vnode.children, true);
        }
        if (componentOptions && componentOptions.children) {
            componentOptions.children = cloneVNodes(componentOptions.children, true);
        }
    }
    return cloned;
}
exports.cloneVNode = cloneVNode;
function cloneVNodes(vnodes, deep) {
    const len = vnodes.length;
    const res = new Array(len);
    for (let i = 0; i < len; i++) {
        res[i] = cloneVNode(vnodes[i], deep);
    }
    return res;
}
exports.cloneVNodes = cloneVNodes;
function cloneElement(n, nodeProps = {}, deep) {
    let ele = n;
    if (Array.isArray(n)) {
        ele = props_util_1.filterEmpty(n)[0];
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
        style = props_util_1.parseStyleText(data.style);
    }
    else {
        style = Object.assign(Object.assign({}, data.style), style);
    }
    if (typeof tempStyle === "string") {
        style = Object.assign(Object.assign({}, style), props_util_1.parseStyleText(style));
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
//# sourceMappingURL=vnode.js.map
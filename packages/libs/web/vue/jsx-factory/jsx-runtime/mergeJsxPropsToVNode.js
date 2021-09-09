"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeJsxPropToVNode = exports.mergeJsxPropsToVNode = void 0;
const tslib_1 = require("tslib");
const VNode_1 = require("./VNode");
const mergeJsxProps_1 = require("./mergeJsxProps");
function mergeJsxPropsToVNode(vnode, ...datas) {
    var _a, _b;
    if (vnode instanceof Array) {
        const r = [];
        for (const i of vnode) {
            r[r.length] = mergeJsxPropsToVNode(i, ...datas);
        }
        // @ts-ignore
        return r;
    }
    else if (vnode) {
        const _c = (vnode === null || vnode === void 0 ? void 0 : vnode.data) || {}, { on = {}, props = {} } = _c, otherData = tslib_1.__rest(_c, ["on", "props"]);
        // vnode.data = _mergeJsxProps([
        //   vnode?.data || {},
        //   ...data
        // ]);
        const merged = mergeJsxProps_1.mergeJsxProps({
            props: Object.assign({}, (((_a = vnode.componentOptions) === null || _a === void 0 ? void 0 : _a.propsData) || props || {})),
            on: Object.assign({}, (getListeners(vnode) || {})),
        }, otherData, ...datas);
        vnode = VNode_1.cloneElement(vnode, merged);
        if (vnode.componentOptions) {
            const { on: listeners } = merged, other = tslib_1.__rest(merged, ["on"]);
            vnode.data = other;
        }
        else {
            vnode.data = merged;
        }
        // console.log(vnode.data)
        // 填补key
        // @ts-ignore
        vnode.key = (_b = vnode.key) !== null && _b !== void 0 ? _b : vnode.data.key;
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
exports.mergeJsxPropsToVNode = mergeJsxPropsToVNode;
function getListeners(vnode) {
    var _a, _b;
    const { listeners } = vnode.componentOptions || {};
    if (!listeners)
        return (_a = vnode.data) === null || _a === void 0 ? void 0 : _a.on;
    const return_listeners = {};
    for (const key in listeners) {
        return_listeners[key] = ((_b = listeners[key]) === null || _b === void 0 ? void 0 : _b.fns) ? listeners[key].fns : listeners[key];
    }
    return return_listeners;
}
function mergeJsxPropToVNode(vnodes, key, value) {
    return mergeJsxPropsToVNode(vnodes, { [key]: value });
}
exports.mergeJsxPropToVNode = mergeJsxPropToVNode;
exports.default = mergeJsxProps_1.mergeJsxProps;
//# sourceMappingURL=mergeJsxPropsToVNode.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllChildren = exports.getAllProps = exports.getSlot = exports.getSlots = exports.camelize = exports.isValidElement = exports.initDefaultProps = exports.parseStyleText = exports.getValueByProp = exports.getAttrs = exports.getKey = exports.getPropsData = exports.slotHasProp = exports.getSlotOptions = exports.getComponentFromProp = exports.getOptionProps = exports.filterProps = exports.hasProp = exports.mergeProps = exports.filterEmpty = exports.isStringElement = exports.isEmptyElement = exports.getComponentName = exports.getStyle = exports.getClass = exports.getListeners = exports.getDataEvents = exports.getEvents = void 0;
/*eslint-disable*/
// @ts-nocheck
const classnames_1 = require("classnames");
const lodash_1 = require("lodash");
function getType(fn) {
    const match = fn && fn.toString().match(/^\s*function (\w+)/);
    return match ? match[1] : "";
}
const camelizeRE = /-(\w)/g;
const camelize = (str) => {
    return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ""));
};
exports.camelize = camelize;
const parseStyleText = (cssText = "", camel) => {
    const res = {};
    const listDelimiter = /;(?![^(]*\))/g;
    const propertyDelimiter = /:(.+)/;
    cssText.split(listDelimiter).forEach(function (item) {
        if (item) {
            const tmp = item.split(propertyDelimiter);
            if (tmp.length > 1) {
                const k = camel ? camelize(tmp[0].trim()) : tmp[0].trim();
                res[k] = tmp[1].trim();
            }
        }
    });
    return res;
};
exports.parseStyleText = parseStyleText;
const hasProp = (instance, prop) => {
    const $options = instance.$options || {};
    const propsData = $options.propsData || {};
    return prop in propsData;
};
exports.hasProp = hasProp;
const slotHasProp = (slot, prop) => {
    const $options = slot.componentOptions || {};
    const propsData = $options.propsData || {};
    return prop in propsData;
};
exports.slotHasProp = slotHasProp;
const filterProps = (props, propsData = {}) => {
    const res = {};
    Object.keys(props).forEach((k) => {
        if (k in propsData || props[k] !== undefined) {
            res[k] = props[k];
        }
    });
    return res;
};
exports.filterProps = filterProps;
const getScopedSlots = (ele) => {
    return (ele.data && ele.data.scopedSlots) || {};
};
const getSlots = (ele) => {
    let componentOptions = ele.componentOptions || {};
    if (ele.$vnode) {
        componentOptions = ele.$vnode.componentOptions || {};
    }
    const children = ele.children || componentOptions.children || [];
    const slots = {};
    children.forEach((child) => {
        if (!isEmptyElement(child)) {
            const name = (child.data && child.data.slot) || "default";
            slots[name] = slots[name] || [];
            slots[name].push(child);
        }
    });
    return Object.assign(Object.assign({}, slots), getScopedSlots(ele));
};
exports.getSlots = getSlots;
const getSlot = (self, name = "default", options = {}) => {
    return ((self.$scopedSlots && self.$scopedSlots[name] && self.$scopedSlots[name](options)) ||
        self.$slots[name] ||
        []);
};
exports.getSlot = getSlot;
const getAllChildren = (ele) => {
    let componentOptions = ele.componentOptions || {};
    if (ele.$vnode) {
        componentOptions = ele.$vnode.componentOptions || {};
    }
    return ele.children || componentOptions.children || [];
};
exports.getAllChildren = getAllChildren;
const getSlotOptions = (ele) => {
    if (ele.fnOptions) {
        // 函数式组件
        return ele.fnOptions;
    }
    let componentOptions = ele.componentOptions;
    if (ele.$vnode) {
        componentOptions = ele.$vnode.componentOptions;
    }
    return componentOptions ? componentOptions.Ctor.options || {} : {};
};
exports.getSlotOptions = getSlotOptions;
const getOptionProps = (instance) => {
    if (instance.componentOptions) {
        const componentOptions = instance.componentOptions;
        const { propsData = {}, Ctor = {} } = componentOptions;
        const props = (Ctor.options || {}).props || {};
        const res = {};
        for (const [k, v] of Object.entries(props)) {
            const def = v.default;
            if (def !== undefined) {
                res[k] =
                    typeof def === "function" && getType(v.type) !== "Function" ? def.call(instance) : def;
            }
        }
        return Object.assign(Object.assign({}, res), propsData);
    }
    const { $options = {}, $props = {} } = instance;
    return filterProps($props, $options.propsData);
};
exports.getOptionProps = getOptionProps;
const getComponentFromProp = (instance, prop, options = instance, execute = true) => {
    if (instance.$createElement) {
        const h = instance.$createElement;
        const temp = instance[prop];
        if (temp !== undefined) {
            return typeof temp === "function" && execute ? temp(h, options) : temp;
        }
        return ((instance.$scopedSlots[prop] && execute && instance.$scopedSlots[prop](options)) ||
            instance.$scopedSlots[prop] ||
            instance.$slots[prop] ||
            undefined);
    }
    else {
        const h = instance.context.$createElement;
        const temp = getPropsData(instance)[prop];
        if (temp !== undefined) {
            return typeof temp === "function" && execute ? temp(h, options) : temp;
        }
        const slotScope = getScopedSlots(instance)[prop];
        if (slotScope !== undefined) {
            return typeof slotScope === "function" && execute ? slotScope(h, options) : slotScope;
        }
        const slotsProp = [];
        const componentOptions = instance.componentOptions || {};
        (componentOptions.children || []).forEach((child) => {
            if (child.data && child.data.slot === prop) {
                if (child.data.attrs) {
                    delete child.data.attrs.slot;
                }
                if (child.tag === "template") {
                    slotsProp.push(child.children);
                }
                else {
                    slotsProp.push(child);
                }
            }
        });
        return slotsProp.length ? slotsProp : undefined;
    }
};
exports.getComponentFromProp = getComponentFromProp;
const getAllProps = (ele) => {
    let data = ele.data || {};
    let componentOptions = ele.componentOptions || {};
    if (ele.$vnode) {
        data = ele.$vnode.data || {};
        componentOptions = ele.$vnode.componentOptions || {};
    }
    return Object.assign(Object.assign(Object.assign({}, data.props), data.attrs), componentOptions.propsData);
};
exports.getAllProps = getAllProps;
const getPropsData = (ele) => {
    let componentOptions = ele.componentOptions;
    if (ele.$vnode) {
        componentOptions = ele.$vnode.componentOptions;
    }
    return componentOptions ? componentOptions.propsData || {} : {};
};
exports.getPropsData = getPropsData;
const getValueByProp = (ele, prop) => {
    return getPropsData(ele)[prop];
};
exports.getValueByProp = getValueByProp;
const getAttrs = (ele) => {
    let data = ele.data;
    if (ele.$vnode) {
        data = ele.$vnode.data;
    }
    return data ? data.attrs || {} : {};
};
exports.getAttrs = getAttrs;
const getKey = (ele) => {
    let key = ele.key;
    if (ele.$vnode) {
        key = ele.$vnode.key;
    }
    return key;
};
exports.getKey = getKey;
function getEvents(child) {
    let events = {};
    if (child.componentOptions && child.componentOptions.listeners) {
        events = child.componentOptions.listeners;
    }
    else if (child.data && child.data.on) {
        events = child.data.on;
    }
    return Object.assign({}, events);
}
exports.getEvents = getEvents;
// 获取 xxx.native 或者 原生标签 事件
function getDataEvents(child) {
    let events = {};
    if (child.data && child.data.on) {
        events = child.data.on;
    }
    return Object.assign({}, events);
}
exports.getDataEvents = getDataEvents;
// use getListeners instead this.$listeners
// https://github.com/vueComponent/ant-design-vue/issues/1705
function getListeners(context) {
    return (context.$vnode ? context.$vnode.componentOptions.listeners : context.$listeners) || {};
}
exports.getListeners = getListeners;
function getClass(ele) {
    let data = {};
    if (ele.data) {
        data = ele.data;
    }
    else if (ele.$vnode && ele.$vnode.data) {
        data = ele.$vnode.data;
    }
    const tempCls = data.class || {};
    const staticClass = data.staticClass;
    let cls = {};
    staticClass &&
        staticClass.split(" ").forEach((c) => {
            cls[c.trim()] = true;
        });
    if (typeof tempCls === "string") {
        tempCls.split(" ").forEach((c) => {
            cls[c.trim()] = true;
        });
    }
    else if (Array.isArray(tempCls)) {
        classnames_1.default(tempCls)
            .split(" ")
            .forEach((c) => {
            cls[c.trim()] = true;
        });
    }
    else {
        cls = Object.assign(Object.assign({}, cls), tempCls);
    }
    return cls;
}
exports.getClass = getClass;
function getStyle(ele, camel) {
    let data = {};
    if (ele.data) {
        data = ele.data;
    }
    else if (ele.$vnode && ele.$vnode.data) {
        data = ele.$vnode.data;
    }
    let style = data.style || data.staticStyle;
    if (typeof style === "string") {
        style = parseStyleText(style, camel);
    }
    else if (camel && style) {
        // 驼峰化
        const res = {};
        Object.keys(style).forEach((k) => (res[camelize(k)] = style[k]));
        return res;
    }
    return style;
}
exports.getStyle = getStyle;
function getComponentName(opts) {
    return opts && (opts.Ctor.options.name || opts.tag);
}
exports.getComponentName = getComponentName;
function isEmptyElement(c) {
    return !(c.tag || (c.text && c.text.trim() !== ""));
}
exports.isEmptyElement = isEmptyElement;
function isStringElement(c) {
    return !c.tag;
}
exports.isStringElement = isStringElement;
function filterEmpty(children = []) {
    return children.filter((c) => !isEmptyElement(c));
}
exports.filterEmpty = filterEmpty;
const initDefaultProps = (propTypes, defaultProps) => {
    Object.keys(defaultProps).forEach((k) => {
        if (propTypes[k]) {
            propTypes[k].def && (propTypes[k] = propTypes[k].def(defaultProps[k]));
        }
        else {
            throw new Error(`not have ${k} prop`);
        }
    });
    return propTypes;
};
exports.initDefaultProps = initDefaultProps;
function mergeProps() {
    const args = [].slice.call(arguments, 0);
    const props = {};
    args.forEach((p = {}) => {
        for (const [k, v] of Object.entries(p)) {
            props[k] = props[k] || {};
            if (lodash_1.isPlainObject(v)) {
                Object.assign(props[k], v);
            }
            else {
                props[k] = v;
            }
        }
    });
    return props;
}
exports.mergeProps = mergeProps;
function isValidElement(element) {
    return (element &&
        typeof element === "object" &&
        "componentOptions" in element &&
        "context" in element &&
        element.tag !== undefined); // remove text node
}
exports.isValidElement = isValidElement;
exports.default = hasProp;
//# sourceMappingURL=props-util.js.map
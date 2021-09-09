import { __rest } from "tslib";
import { h, isVue2 } from "vue-demi";
import { mergeJsxProps } from "./mergeJsxProps";
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
export const getEventNames = (options) => Object.keys(options).filter((option) => option.startsWith("on"));
const mapEventNamesToHandlerPairs = (options, eventNames) => {
    const r = {};
    for (const eventName of eventNames) {
        if (eventName && options[eventName]) {
            r[eventName.substring(2).toLowerCase()] = options[eventName];
        }
    }
    return r;
};
export const getAttributes = (options, excluded) => {
    const result = {};
    for (const key in options) {
        if (!excluded.includes(key)) {
            result[key] = options[key];
        }
    }
    return result;
};
// Object.fromEntries(Object.entries(options).filter(([option]) => !excluded.includes(option)));
export const boxSlots = (slots) => {
    const result = {};
    if (slots) {
        for (const key in slots) {
            result[key] = () => slots[key];
        }
    }
    return result;
};
export const getJArgumentsWithOptions = (element, options, children) => {
    const eventNames = getEventNames(options);
    const elementIsAComponent = typeof element !== "string";
    const _a = options, _b = CLASS_NAME, className = _a[_b], _c = REF, ref = _a[_c], _d = STYLE, style = _a[_d], _e = SCOPED_SLOTS, scopedSlots = _a[_e], _f = SLOT, slot = _a[_f], _g = CHILDREN, _children = _a[_g], _h = SLOTS, slots = _a[_h], _j = V_SLOT, vSlot = _a[_j], _k = ON, on = _a[_k], _l = MODEL, model = _a[_l], _m = V_MODEL, _o = _a[_m], vModel = _o === void 0 ? model : _o, { key, mergeJsxProps: _mergeJsxPropsArgs } = _a, _p = NATIVEON, nativeOn = _a[_p], _q = PROPS, _props = _a[_q], _r = ATTRS, attrs = _a[_r], { domPropsInnerHTML: domPropsInnerHTML } = _a, OTHER = __rest(_a, [typeof _b === "symbol" ? _b : _b + "", typeof _c === "symbol" ? _c : _c + "", typeof _d === "symbol" ? _d : _d + "", typeof _e === "symbol" ? _e : _e + "", typeof _f === "symbol" ? _f : _f + "", typeof _g === "symbol" ? _g : _g + "", typeof _h === "symbol" ? _h : _h + "", typeof _j === "symbol" ? _j : _j + "", typeof _k === "symbol" ? _k : _k + "", typeof _l === "symbol" ? _l : _l + "", typeof _m === "symbol" ? _m : _m + "", "key", "mergeJsxProps", typeof _p === "symbol" ? _p : _p + "", typeof _q === "symbol" ? _q : _q + "", typeof _r === "symbol" ? _r : _r + "", "domPropsInnerHTML"]);
    const props = getAttributes(OTHER, eventNames);
    const data = mergeJsxProps({
        [CLASS_NAME]: className,
        [STYLE]: style,
        [REF]: (isVue2 && (ref === null || ref === void 0 ? void 0 : ref.name)) || ref,
        [SLOT]: vSlot || slot,
        [SCOPED_SLOTS]: scopedSlots,
        [ON]: mapEventNamesToHandlerPairs(options, eventNames),
        [MODEL]: vModel,
        domProps: domPropsInnerHTML && {
            innerHTML: domPropsInnerHTML,
        },
        key,
        [elementIsAComponent ? PROPS : ATTRS]: props,
    }, { props: _props, attrs, nativeOn, on, scopedSlots: boxSlots(slots) }, ...(_mergeJsxPropsArgs || []));
    return {
        data,
        children: _children ? [_children, children] : children,
    };
};
export function jsxEsbuild(element, options, ...children) {
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
export function jsx(element, props, key) {
    if (props) {
        const { children } = props, options = __rest(props, ["children"]);
        const { data, children: renderChildren } = getJArgumentsWithOptions(element, options, children || []);
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
export const Fragment = Symbol("Fragment");
export * from "./mergeJsxPropsToVNode";
export * from "./VNode";
//# sourceMappingURL=index.js.map
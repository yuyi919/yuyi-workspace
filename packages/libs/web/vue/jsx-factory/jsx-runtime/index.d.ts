import Vue, { VNodeChildren, VueConstructor } from "vue";
import { VNodeData } from "./mergeJsxProps";
export interface ExtendIntrinsicAttributes {
    ["v-slot"]?: string;
    /**
     * 显示传入合并vue-jsx的props(包含attrs,props,on,nativeOn,etc.)
     */
    mergeJsxProps?: VNodeData[];
    class?: VNodeData["class"];
    staticClass?: VNodeData["staticClass"];
    key?: VNodeData["key"];
    ref?: VNodeData["ref"] | {
        value: unknown;
    };
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
declare type Element = string | VueConstructor<Vue>;
export declare type Options = {
    [option: string]: any;
};
export declare const getEventNames: (options: Options) => string[];
export declare const getAttributes: (options: Options, excluded: string[]) => {};
export declare const boxSlots: (slots: any) => {};
export declare const getJArgumentsWithOptions: (element: Element, options: Options, children: VNodeChildren | VNodeChildren[]) => {
    data: Options;
    children: VNodeChildren[] | VNodeChildren;
};
export declare function jsxEsbuild(element: Element, options: Options | null, ...children: VNodeChildren[]): string | boolean | import("vue").VNodeChildrenArrayContents | [import("vue/types/vnode").ScopedSlot] | import("vue").VNode;
export declare function jsx(element: Element, props: Options | null, key?: string): string | boolean | import("vue").VNodeChildrenArrayContents | [import("vue/types/vnode").ScopedSlot] | import("vue").VNode;
export declare const jsxs: typeof jsx;
export declare const Fragment: Element;
export * from "./mergeJsxPropsToVNode";
export * from "./VNode";
//# sourceMappingURL=index.d.ts.map
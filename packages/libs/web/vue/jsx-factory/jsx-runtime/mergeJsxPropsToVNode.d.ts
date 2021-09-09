import { VNode } from "vue";
import { mergeJsxProps } from "./mergeJsxProps";
export declare function mergeJsxPropsToVNode(vnode: VNode[], ...datas: (VNode["data"] & {
    children?: VNode[];
})[]): VNode[];
export declare function mergeJsxPropsToVNode(vnode: VNode, ...datas: (VNode["data"] & {
    children?: VNode[];
})[]): VNode;
export declare function mergeJsxPropsToVNode(vnode: VNode | VNode[], ...datas: (VNode["data"] & {
    children?: VNode[];
})[]): VNode | VNode[];
export declare function mergeJsxPropToVNode(vnodes: VNode, key: string, value: any): VNode;
export declare function mergeJsxPropToVNode(vnodes: VNode[], key: string, value: any): VNode[];
export declare function mergeJsxPropToVNode(vnodes: VNode | VNode[], key: string, value: any): VNode | VNode[];
export default mergeJsxProps;
//# sourceMappingURL=mergeJsxPropsToVNode.d.ts.map
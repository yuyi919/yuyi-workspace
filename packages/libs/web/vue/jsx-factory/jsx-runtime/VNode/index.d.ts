import { VNode } from "vue";
export declare function isVNode(vnode: any): vnode is VNode;
export declare function getVNodeVShow(vnode: VNode): boolean;
export declare function getChildren(vnode: VNode, defaultValue?: VNode[]): VNode[];
export declare function setChildren(vnode: VNode, children: VNode | VNode[]): VNode;
export declare function hackVnodeChildren(vnode: VNode, replacer: (child: VNode["children"]) => VNode | VNode[]): VNode;
export declare function cloneElement(n: VNode, nodeProps?: any, deep?: boolean): any;
export { getKey as getVNodeKey, getOptionProps as getVNodeProps, } from "./_built/props-util";
//# sourceMappingURL=index.d.ts.map
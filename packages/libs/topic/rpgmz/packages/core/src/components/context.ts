// import { Component, Prop, PropTypes } from "@yuyi919/vue-shared-decorators";
// import { createContext, unwrap, WrapValue } from "@yuyi919/vue-use";
// import { Application } from "pixi.js";
// import {
//   ComponentInternalInstance,
//   computed,
//   ComputedRef,
//   getCurrentInstance,
//   onUpdated,
//   provide,
//   SetupContext,
//   shallowReactive,
//   shallowRef,
// } from "vue-demi";
// import { Window_Selectable } from "../windows";
// import { EventHandlers } from "./constants";
// import { SuperScene } from "./super/Scene";
// import { useExtrenalInstance } from "./_util";

// interface Emitter<E extends string[]> {
//   emit: Shim.EmitFn<E>;
//   on(event: E[number], handle: Function): void;
//   off(event: E[number], handle: Function): void;
// }
// interface PApplicationContext {
//   instance: Application | null;
//   EventBus: Emitter<EventHandlers[]>;
//   isReady: boolean;
// }
// export const PSceneContext = createContext<{
//   scene: SuperScene;
// }>("Scene_Base");

// export const PApplicationContext = createContext<PApplicationContext>("Pixi.Application");
// export function provideApplicationContext(
//   context: SetupContext<EventHandlers[]>,
//   app?: WrapValue<Application>
// ) {
//   const ins = getCurrentInstance();
//   const appRef = shallowRef(unwrap(app));
//   const state: PApplicationContext = shallowReactive({
//     get instance() {
//       return appRef.value;
//     },
//     set instance(app) {
//       appRef.value = app;
//     },
//     isReady: false,
//     EventBus: {
//       emit(event: any, ...args: any[]) {
//         context.emit(event, ...args);
//       },
//       on(event: string, handle: Function) {
//         ins.proxy.$on(event, handle);
//       },
//       off(event: string, handle: Function) {
//         ins.proxy.$off(event, handle);
//       },
//     },
//   }) as any;
//   PApplicationContext.provide(state);
//   provide(
//     "app",
//     shallowReactive({
//       get instance() {
//         return appRef.value;
//       },
//       get isReady() {
//         return state.isReady;
//       },
//       EventBus: {
//         $emit(event: any, ...args: any[]) {
//           context.emit(event, ...args);
//         },
//         $on(event: string, handle: Function) {
//           ins.proxy.$on(event, handle);
//         },
//         $off(event: string, handle: Function) {
//           ins.proxy.$off(event, handle);
//         },
//       },
//     })
//   );
//   console.log(state);
//   return [state, useInstance(state, ins)] as const;
// }

// export function useApplicationContext(ins = getCurrentInstance()) {
//   const state = PApplicationContext.inject();
//   return [state] as const;
// }

// export function useContainer<T>(target: WrapValue<T>, ins = getCurrentInstance()) {
//   return useExtrenalInstance(
//     {
//       get instance() {
//         return unwrap(target);
//       },
//     },
//     ins
//   );
// }

// export function useInstance(state: PApplicationContext, ins = getCurrentInstance()) {
//   return useExtrenalInstance(
//     {
//       init(app: Application) {
//         state.instance = app;
//       },
//       ready() {
//         state.isReady = true;
//       },
//       get isReady() {
//         return state.isReady;
//       },
//       get appliaction() {
//         return state.instance;
//       },
//       get instance() {
//         return state.instance.stage;
//       },
//       get renderer() {
//         return state.instance.renderer;
//       },
//     },
//     ins
//   );
// }

// export type RootInstance = ReturnType<typeof useInstance>;
// export type ParentInstance<T extends PIXI.Container = PIXI.Container> = Vue & {
//   instance: T;
//   $parent: ParentInstance;
// };

// @Component({})
// export class PContainerProps {
//   @Prop({ type: Object })
//   parent?: PIXI.Container;

//   @Prop(PropTypes.oneOf(["root", "scene", "parent"] as const).def("parent"))
//   target?: "root" | "scene" | "parent";
// }

// export function useParent(props: PContainerProps, sceneContext = PSceneContext.inject()) {
//   const rootContext = PApplicationContext.inject();
//   const instance = getCurrentInstance();
//   return computed(() => {
//     if (props.target === "parent") {
//       return props.parent || (instance.parent?.proxy as ParentInstance)?.instance;
//     } else if (props.target === "root") {
//       return rootContext.instance.stage;
//     } else if (props.target === "scene") {
//       return sceneContext.scene;
//     }
//     return (
//       props.parent ||
//       (instance.parent?.proxy as ParentInstance)?.instance ||
//       sceneContext.scene ||
//       rootContext.instance.stage
//     );
//   });
// }

// const WindowContext = createContext<ComputedRef<Window_Selectable>>("window_core");
// export function useWindow<T extends Window_Selectable>(): ComputedRef<T>;
// export function useWindow<T extends Window_Selectable>(window: ComputedRef<T>): void;
// export function useWindow<T extends Window_Selectable>(window?: ComputedRef<T>) {
//   if (window) {
//     WindowContext.provide(window);
//     return;
//   }
//   return WindowContext.inject();
// }

// namespace Shim {
//   export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
//     k: infer I
//   ) => void
//     ? I
//     : never;
//   export type ObjectEmitsOptions$1 = Record<string, ((...args: any[]) => any) | null>;
//   export type EmitFn<
//     Options = ObjectEmitsOptions$1,
//     Event extends keyof Options = keyof Options
//   > = Options extends Array<infer V>
//     ? (event: V, ...args: any[]) => void
//     : {} extends Options
//     ? (event: string, ...args: any[]) => void
//     : UnionToIntersection<
//         {
//           [key in Event]: Options[key] extends (...args: infer Args) => any
//             ? (event: key, ...args: Args) => void
//             : (event: key, ...args: any[]) => void;
//         }[Event]
//       >;
// }

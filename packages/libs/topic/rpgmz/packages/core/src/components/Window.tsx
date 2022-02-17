// import { Component, extractProps, Prop } from "@yuyi919/vue-shared-decorators";
// import { unwrap, useWrap, WrapValue } from "@yuyi919/vue-use";
// import {
//   computed,
//   defineComponent,
//   onMounted,
//   reactive,
//   shallowReactive,
//   watch,
//   watchEffect,
//   WatchSource,
//   WatchStopHandle,
// } from "vue-demi";
// import { Graphics } from "../dom";
// import { createRectangleLike, RectangleLike } from "../pixi";
// import { Scene_Base } from "../scenes";
// import { Window_Base as WindowBase, Window_Command, Window_Help } from "../windows";
// import { EventHandlers } from "./constants";
// import { PContainerProps, PSceneContext, useParent, useWindow } from "./context";
// import { useExtrenalInstance } from "./_util";

// @Component({})
// export class PBaseWindowProps extends PContainerProps {
//   @Prop(String)
//   name: string;

//   @Prop(Number)
//   width?: number;

//   @Prop(Number)
//   height?: number;

//   @Prop({ type: Number, default: 0 })
//   x?: number;

//   @Prop({ type: Number, default: 0 })
//   y?: number;

//   @Prop({ type: Number, default: 0 })
//   openness?: number;

//   @Prop({ type: null })
//   factory?: WindowFactory<WindowBase>;
// }

// @Component({})
// export class PWindowProps extends PBaseWindowProps {
//   @Prop({ type: String })
//   help?: string;
// }

// function useContainer<T extends PIXI.Container>(
//   container: WrapValue<T>,
//   parent?: WrapValue<PIXI.Container>
// ): T {
//   const ins = useExtrenalInstance({
//     get instance() {
//       return unwrap(container);
//     },
//   });
//   onMounted(() => {
//     const p = unwrap(parent);
//     console.log(p);
//     if (p instanceof Scene_Base) {
//       p.addWindow(ins.instance);
//     } else p?.addChild(ins.instance);
//   });
//   return ins.instance;
// }

// type WindowFactory<T extends WindowBase> = {
//   window?: T;
//   factory: WrapValue<T, [RectangleLike]>;
//   parent?: PIXI.Container;
// };
// export function useWindowFactory<T extends WindowBase>(factory: WrapValue<T, [RectangleLike]>) {
//   return shallowReactive({
//     window: void 0,
//     factory,
//     parent: void 0,
//   }) as WindowFactory<T>;
// }

// type MapSources<T> = {
//   [K in keyof T]: T[K] extends WatchSource<infer V> ? V : never;
// };
// type MapOldSources<T, Immediate> = {
//   [K in keyof T]: T[K] extends WatchSource<infer V>
//     ? Immediate extends true
//       ? V | undefined
//       : V
//     : never;
// };
// export function useWindowEffect<T extends WindowBase, Deps extends WatchSource<unknown>[]>(
//   factory: WindowFactory<T>,
//   effectHandler: (
//     window: T,
//     deps: MapSources<Deps>,
//     prevDeps?: MapOldSources<Deps, true>
//   ) => (() => void) | null | undefined,
//   dependencies: Deps
// ): WatchStopHandle {
//   const windowRef = computed(() => factory.window);
//   return watch(
//     [windowRef, ...dependencies] as const,
//     ([window, ...changedDependencies], [, ...prevDependencies], onCleanUp) => {
//       const effectCleaner = effectHandler(window, changedDependencies, prevDependencies);
//       onCleanUp?.(effectCleaner);
//     },
//     { immediate: true }
//   );
// }

// export function createCommandWindow(props: PWindowProps): Constructable<Window_Command> {
//   return class TestCommand extends Window_Command {
//     initialize(rect?: RectangleLike): void {
//       super.initialize(rect);
//     }

//     updateHelp() {
//       this._helpWindow.setText(props.help);
//     }

//     makeCommandList(): void {
//       this.addCommand("测试", "test");
//       this.addCommand("测试2", "test2");
//       this.addCommand("测试3", "test3");
//       this.setHandler("cancel", () => this.close());
//       this.setHandler("test", () => {
//         console.log("test");
//         this.close();
//       });
//       this.setHandler("ok", () => {
//         console.log("ok");
//         this.close();
//       });
//     }

//     // maxCols(): number {
//     //   return 4;
//     // }

//     itemTextAlign(): CanvasTextAlign {
//       return "center";
//     }
//   };
// }

// export const PBaseWindow = defineComponent({
//   props: extractProps(PBaseWindowProps),
//   emits: EventHandlers,
//   setup(props: PBaseWindowProps, context) {
//     const rect = reactive(createRectangleLike(props.x, props.y, props.width, props.height));
//     const windowRef = useWindow() || useWrap(props.factory.factory, rect);
//     watchEffect(() => {
//       windowRef.value?.move(props.x, props.y, props.width, props.height);
//       rect.x = props.x;
//       rect.y = props.y;
//       rect.width = props.width;
//       rect.height = props.height;
//     });
//     watch(
//       windowRef,
//       (window, prevWindow) => {
//         if (window) {
//           props.factory.window = window;
//           window.openness = props.openness;
//           window.open();
//         } else if (prevWindow) {
//           props.factory.window = null;
//           prevWindow.close();
//         }
//       },
//       { immediate: true }
//     );
//     useContainer(windowRef, useParent(props));
//     return () => {
//       return (
//         <i data-name={props.name} data-role="window">
//           {context.slots.default?.()}
//         </i>
//       );
//     };
//   },
// });

// export const PHelperWindow = defineComponent({
//   props: extractProps(PWindowProps),
//   emits: EventHandlers,
//   setup(props, context) {
//     const sceneContext = PSceneContext.inject();
//     const ww = sceneContext.scene.mainCommandWidth();
//     const wh = sceneContext.scene.calcWindowHeight(1, true);
//     const wx = (Graphics.boxWidth - ww) / 2;
//     const windowWrap = useWindowFactory((rect) => new Window_Help(rect));

//     useWindowEffect(
//       windowWrap,
//       (window, [help], [prev]) => {
//         if (window) {
//           if (help) {
//             window.setText(help);
//           } else if (prev) {
//             window.clear();
//           }
//         }
//         return () => {
//           window?.clear();
//         };
//       },
//       [computed(() => props.help)]
//     );
//     const parent = useParent(props);
//     return () => (
//       <PBaseWindow
//         {...props}
//         parent={parent.value}
//         factory={windowWrap}
//         x={wx}
//         y={0}
//         width={ww}
//         height={wh}
//       >
//         {context.slots.default?.()}
//       </PBaseWindow>
//     );
//   },
// });

// export const PWindow = defineComponent({
//   props: extractProps(PWindowProps),
//   emits: EventHandlers,
//   setup(props, context) {
//     const sceneContext = PSceneContext.inject();
//     const ww = sceneContext.scene.mainCommandWidth();
//     const wh = sceneContext.scene.calcWindowHeight(2, true);
//     const wx = (Graphics.boxWidth - ww) / 2;
//     const wy = Graphics.boxHeight / 2 - wh / 2;
//     const WindowCls = createCommandWindow(props);
//     const window = useWindowFactory((rect) => {
//       return new WindowCls(rect);
//     });
//     const parent = useParent(props);
//     // sceneContext.scene.removeWindow(helper)
//     // Create a graphics object to define our mask
//     // const mask = new PIXI.Graphics();
//     // // Add the rectangular area to show
//     // mask.beginFill(0xffffff);
//     // mask.drawCircle(wx, wy, ww/2);
//     // mask.endFill();
//     // window.mask = mask
//     return () => {
//       return (
//         <i>
//           <PBaseWindow
//             {...props}
//             parent={parent.value}
//             factory={window}
//             x={wx}
//             y={wy}
//             width={ww}
//             height={wh}
//           >
//             {context.slots.default?.()}
//           </PBaseWindow>
//           <PHelperWindow {...props} parent={parent.value} />
//         </i>
//       );
//     };
//   },
// });

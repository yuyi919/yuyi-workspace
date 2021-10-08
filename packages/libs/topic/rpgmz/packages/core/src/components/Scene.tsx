import { Component, extractProps, Prop } from "@yuyi919/vue-shared-decorators";
import { useWrap, WrapValue } from "@yuyi919/vue-use";
import { defineComponent, shallowReactive, watch } from "vue-demi";
import { Window_Base } from "../windows";
import { EventHandlers } from "./constants";
import { PSceneContext, useParent } from "./context";
import { SuperScene } from "./super/Scene";
import { useExtrenalInstance } from "./_util";

@Component({})
export class PSceneProps {
  @Prop(String)
  name: string;

  @Prop({ type: Object })
  parent?: PIXI.Container;
}

class PSceneCore extends SuperScene {
  addWindow(window: PIXI.DisplayObject | Window_Base): void {
    if (!this._windowLayer) {
      this.createWindowLayer();
    }
    super.addWindow(window);
  }
}

function useContainer<T extends PIXI.Container>(
  container: WrapValue<T>,
  parent?: WrapValue<PIXI.Container>
): T {
  const containerRef = useWrap(container);
  const parentRef = parent && useWrap(parent);
  const ins = useExtrenalInstance({
    get instance() {
      return containerRef.value;
    },
  });
  parentRef &&
    watch(
      [containerRef, parentRef],
      ([current, parent]) => {
        if (current && parent) {
          parent.addChild(current);
        }
      },
      { immediate: true }
    );
  return ins.instance;
}
export function useScene() {}

export const PScene = defineComponent({
  props: extractProps(PSceneProps),
  emits: EventHandlers,
  setup(props, context) {
    const sceneRef = shallowReactive({
      scene: new PSceneCore(),
    });
    PSceneContext.provide(sceneRef);
    useContainer(sceneRef.scene, useParent(props));
    return () => {
      console.log(context.slots.default?.())
      return <i data-role="scene">{context.slots.default?.()}</i>;
    };
  },
});

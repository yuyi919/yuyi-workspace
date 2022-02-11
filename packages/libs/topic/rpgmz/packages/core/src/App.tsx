import { defineComponent } from "vue-demi";
import { createApp, shallowRef } from "vue-demi";
import { PText } from "vue-pixi-wrapper";
import { PApplication, PApplicationProps, PScene } from "./components";
import { RootInstance } from "./components/context";
import { PWindow } from "./components/Window";
import { $gameSystem, SceneManager } from "./managers";

declare module "vue-pixi-wrapper" {
  interface PApplication {
    $props: Partial<PApplication>;
  }
  interface PText {
    $props: Partial<PText>;
  }
  interface PGraphics {
    $props: Partial<PGraphics>;
  }
}

export const App = defineComponent({
  setup() {
    return () => {
      return (
        <PScene name={"test"} parent={SceneManager._scene}>
          <PWindow name="test" help="test">
            <PText
              text="text"
              textStyle={{
                fontFamily: "Arial",
                fontSize: 36,
                fontStyle: "italic",
                fontWeight: "bold",
                fill: ["#ffffff", "#00ff99"], // gradient
                stroke: "#4a1850",
                strokeThickness: 5,
                dropShadow: true,
                dropShadowColor: "#000000",
                dropShadowBlur: 4,
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 6,
                wordWrap: true,
                wordWrapWidth: 440,
              }}
            />
          </PWindow>
        </PScene>
      );
    };
  },
});

export const run = (el: HTMLCanvasElement, props: PApplicationProps = {}) => {
  const vue = createApp(
    {
      setup() {
        const text = shallowRef<JSX.Element>(null);
        setTimeout(() => {
          text.value = <App />;
        }, 1000);
        return () => {
          return (
            <PApplication canvasId={el.id} mergeJsxProps={[{ props }]}>
              {text.value}
            </PApplication>
          );
        };
      },
    },
    props
  );
  vue.config.silent = true;
  return vue.mount(el).$children[0] as RootInstance;
};

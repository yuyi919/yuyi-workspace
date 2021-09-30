import { PApplication, PText } from "vue-pixi-wrapper";
import { createApp, defineComponent } from "vue-demi";

declare module "vue-pixi-wrapper" {
  interface PApplication {
    $props: Partial<PApplication>;
  }
  interface PText {
    $props: Partial<PText>;
  }
}

export const Application = defineComponent({
  setup() {
    return () => {
      return (
        <PApplication width={800} height={600} backgroundColor={0x000000}>
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
        </PApplication>
      );
    };
  },
});

export const run = () => createApp(Application, {}).mount("#root");

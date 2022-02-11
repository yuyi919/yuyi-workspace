import { Component, extractProps, Prop } from "@yuyi919/vue-shared-decorators";
import { Application, utils } from "pixi.js";
import { defineComponent, onMounted, ref, SetupContext } from "vue-demi";
import { EventHandlers } from "./constants";
import { provideApplicationContext } from "./context";
type ApplicationProps = ConstructorParameters<typeof Application>[0];

@Component({})
export class PApplicationProps implements ApplicationProps {
  @Prop({ type: String, default: "canvas" })
  readonly canvasId?: string;

  @Prop({ type: Boolean, default: false })
  readonly skipHello?: boolean;

  @Prop({ type: Boolean, default: false })
  readonly enableTicker?: boolean;

  @Prop({ type: Boolean, default: true })
  readonly autoStart?: boolean;

  @Prop({ type: Number, default: 800 })
  readonly width?: number;

  @Prop({ type: Number, default: 600 })
  readonly height?: number;

  @Prop({ type: Boolean, default: false })
  readonly transparent?: boolean;

  @Prop({ type: Boolean, default: false })
  readonly autoDensity?: boolean;

  @Prop({ type: Boolean, default: false })
  readonly antialias?: boolean;

  @Prop({ type: Boolean, default: false })
  readonly preserveDrawingBuffer?: boolean;

  @Prop({ type: Number, default: 1 })
  readonly resolution?: number;

  @Prop({ type: Boolean })
  readonly forceCanvas?: boolean;

  @Prop({ type: Number, default: 0x000000 })
  readonly backgroundColor?: number;

  @Prop({ type: Boolean, default: true })
  readonly clearBeforeRender?: boolean;

  @Prop({ type: Boolean, default: false })
  readonly forceFXAA?: boolean;

  @Prop({ type: String })
  readonly powerPreference?: string;

  @Prop({ type: Boolean, default: false })
  readonly sharedLoader?: boolean;

  @Prop({ type: Boolean })
  readonly interactive?: boolean;
}

export const PApplication = defineComponent({
  props: extractProps(PApplicationProps),
  emits: EventHandlers,
  setup(props, context) {
    const render = useApplication(props, context);
    return () => {
      return (
        <canvas ref={render} id={props.canvasId}>
          {context.slots.default?.()}
        </canvas>
      );
    };
  },
});
function useApplication(
  props: PApplicationProps,
  context: SetupContext<string[] | Record<string, (...args: any[]) => any>>
) {
  const render = ref<HTMLCanvasElement>();
  const [state, { ready, init }] = provideApplicationContext(
    context as SetupContext<EventHandlers[]>
  );
  function initEvents() {
    for (const event in context.listeners) {
      const index = EventHandlers.findIndex((item) => item === event);
      if (index === -1) {
        console.error(`[Even listener error]: There's no event listener for event name '${event}'`);
      } else {
        state.instance.stage.on(event, (e: Event) => context.emit(event, e));
      }
    }
  }
  onMounted(() => {
    const canvas = render.value;
    if (props.skipHello) {
      utils.skipHello();
    }
    const instance = new Application({
      ...props,
      view: canvas,
    });
    init(instance);
    ready();
    // this.initProps();
    initEvents();

    state.EventBus.emit("ready");
    context.emit("ready", instance);

    if (props.enableTicker) {
      // only enable ticker if need
      instance.ticker.add((delta: number) => context.emit("ticker", delta));
    }
  });
  return render;
}

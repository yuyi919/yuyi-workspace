import { applyDefaultProps } from "@inlet/react-pixi/animated";
import { DisplayObjectProps } from "@plugins/react-pixijs";
import { CustomPixi } from "../utils";

export const KeepedContainer = CustomPixi("KeepedContainer", {
  create(props: DisplayObjectProps<PIXI.Container>) {
    return new PIXI.Container();
  },
  applyProps(container: PIXI.Container, otherOldProps, otherNewProps) {
    applyDefaultProps(container, otherOldProps, otherNewProps);
  },
  willUnmount(instance, parent) {
    const onRemoved: Promise<void>[] = [];
    for (const child of instance.children) {
      child.destroy();
      onRemoved.push(new Promise<void>((resolve) => child.once("removed", () => resolve())));
    }
    Promise.all(onRemoved).then(() => {
      instance.destroy();
    });
  }
});

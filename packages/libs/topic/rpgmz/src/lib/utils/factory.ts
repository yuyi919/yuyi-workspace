import {
  applyDefaultProps,
  Container,
  PixiComponent,
  useApp,
  AnimatedComponent,
  _ReactPixi
} from "@inlet/react-pixi/animated";
import React from "react";

declare module "@inlet/react-pixi/animated" {
  namespace _ReactPixi {
    interface ICustomComponent<
      P extends { [key: string]: any },
      PixiInstance extends PIXI.DisplayObject
    > {
      /**
       * Reconcile config
       */
      config?: {
        /**
         * Destroy instance on unmount?
         * @default true
         */
        destroy?: boolean;

        /**
         * Destroy child instances?
         * @default true
         */
        destroyChildren?: boolean;
      };
    }
  }
}

export function CustomPixi<Props, PixiInstance extends PIXI.DisplayObject>(
  componentName: string,
  lifecycle: _ReactPixi.ICustomComponent<Props, PixiInstance>
): AnimatedComponent<React.FC<Props & { ref?: React.Ref<PixiInstance> }>> {
  return PixiComponent(componentName, {
    ...lifecycle,
    config: {
      destroy: false,
      destroyChildren: false
    },
    willUnmount(instance, parent) {
      hackDestory(instance, parent);
      console.log("willUnmount", instance);
      if (lifecycle.willUnmount) {
        lifecycle?.willUnmount(instance, parent);
      } else {
        instance.destroy();
      }
    }
  });
}
function hackDestory(target: PIXI.DisplayObject, parent: PIXI.Container = target.parent) {
  const newP = new PIXI.Container();
  const childIndex = parent.getChildIndex(target);
  newP.addChild(target);
  parent.addChildAt(newP, childIndex);
}

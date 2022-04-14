import { AnimatedComponent, PixiComponent, _ReactPixi } from "@inlet/react-pixi/animated";
import { AnimatedDisplayObjectProps } from "@plugins/react-pixijs";
import Types from "@yuyi919/shared-types";
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

export function CustomPixi<
  PixiClass extends Types.AnyConstructorType<PIXI.DisplayObject>,
  Props extends Types.ConstructorArgs<PixiClass>[0],
  PixiInstance extends InstanceType<PixiClass>
>(
  pixiClass: PixiClass,
  lifecycle: Omit<_ReactPixi.ICustomComponent<Props, PixiInstance>, "create">
): AnimatedComponent<React.FC<Props & { ref?: React.Ref<PixiInstance> }>>;
export function CustomPixi<Props, PixiInstance extends PIXI.DisplayObject>(
  componentName: string,
  lifecycle: _ReactPixi.ICustomComponent<Props, PixiInstance>
): AnimatedComponent<React.FC<Props & { ref?: React.Ref<PixiInstance> }>>;
export function CustomPixi<Props, PixiInstance extends PIXI.DisplayObject>(
  target: any,
  lifecycle: _ReactPixi.ICustomComponent<Props, PixiInstance>
): AnimatedComponent<React.FC<Props & { ref?: React.Ref<PixiInstance> }>> {
  let name: string;
  if (target instanceof Function) {
    name = target.displayName || target.name;
  } else {
    name = target;
  }
  return PixiComponent(name, {
    create(props: any) {
      return new target(props);
    },
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

abstract class CustomPixiComponent<
  P extends { [key: string]: any },
  PixiInstance extends PIXI.DisplayObject
> {
  /**
   * Create the PIXI instance
   * The component is created during React reconciliation.
   *
   * @param props passed down props
   */
  constructor(props: P) {}

  /**
   * Instance mounted
   * This is called during React reconciliation.
   *
   * @param {PIXI.DisplayObject} instance
   * @param {PIXI.Container} parent
   */
  didMount?(instance: PixiInstance, parent: PIXI.Container): void;

  /**
   * Instance will unmount
   * This is called during React reconciliation.
   *
   * @param {PIXI.DisplayObject} instance
   * @param {PIXI.Container} parent
   */
  willUnmount?(instance: PixiInstance, parent: PIXI.Container): void;

  /**
   * Apply props for this custom component.
   * This is called during React reconciliation.
   *
   * @param {PIXI.DisplayObject} instance
   * @param oldProps
   * @param newProps
   */
  abstract applyProps?(instance: PixiInstance, oldProps: Readonly<P>, newProps: Readonly<P>): void;
}

function extend<T extends typeof PIXI.DisplayObject>(DisplayObject: T) {
  return DisplayObject as new (...args: Types.ConstructorArgs<T>) => CustomPixiComponent<
    AnimatedDisplayObjectProps<InstanceType<T>>,
    InstanceType<T>
  >;
}

const C = extend(PIXI.Container);
new C();
class Template extends extend(PIXI.Container) {
  constructor(props) {
    super();
  }
  applyProps?(instance: PIXI.Container, oldProps: Readonly<any>, newProps: Readonly<any>): void {}
}

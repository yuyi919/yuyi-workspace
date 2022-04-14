import { _ReactPixi } from "@inlet/react-pixi/animated";
import { Types } from "@yuyi919/shared-types";
import * as PIXI from "pixi.js";
import React from "react";
import { AnimatedProps } from "react-spring";

// 补充遗漏的定义
declare module "@inlet/react-pixi/animated" {
  // unmount component
  export const unmountComponentAtNode: (container: PIXI.Container) => void;
}

type FilterPropsKeys<T, U> = {
  // 移除内部字段(_开头)
  [key in keyof T]: key extends `_${string}` ? never : T[key] extends U ? never : key;
}[keyof T];

type FixProps<T, U> = Pick<T, FilterPropsKeys<T, U>>;

export type AnimatedDisplayObjectProps<
  T extends PIXI.DisplayObject,
  U = {},
  PickKeys extends keyof T = keyof T
> = AnimatedProps<
  Partial<
    Omit<
      FixProps<Pick<T, PickKeys>, Types.Function.Base>,
      "children" | _ReactPixi.P | _ReactPixi.ReadonlyKeys<T> | keyof U
    > &
      _ReactPixi.WithPointLike<_ReactPixi.P>
  > &
    U
> &
  _ReactPixi.InteractionEvents & { ref?: React.Ref<T> };

export type DisplayObjectProps<
  T extends PIXI.DisplayObject = PIXI.DisplayObject,
  U = {},
  PickKeys extends keyof T = keyof T
> = Partial<
  Omit<
    FixProps<Pick<T, PickKeys>, Types.Function.Base>,
    "children" | _ReactPixi.P | _ReactPixi.ReadonlyKeys<T> | keyof U
  > &
    _ReactPixi.WithPointLike<_ReactPixi.P>
> &
  U &
  _ReactPixi.InteractionEvents & { ref?: React.Ref<T> };

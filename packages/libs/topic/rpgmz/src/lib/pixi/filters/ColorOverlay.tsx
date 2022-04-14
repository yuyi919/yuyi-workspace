import { applyDefaultProps, Container, withFilters } from "@inlet/react-pixi/animated";
import { SpringValue, to, animated } from "@react-spring/web";
import {
  addFluidObserver,
  removeFluidObserver,
  getFluidValue,
  getFluidObservers,
  FluidValue
} from "@react-spring/shared";
import { ColorOverlayFilter } from "pixi-filters";
import React from "react";
import { CustomPixi, watchFluidValue } from "../../utils";
import { AnimatedDisplayObjectProps } from "@plugins/react-pixijs";
import { AmoyBrokenCamDistortionFilter } from "./bcr";

const ColorOverlayFilter2 = withFilters(Container, {
  colorOverlay: ColorOverlayFilter
  // noise: PIXI.filters.NoiseFilter
  // adjust: AdjustmentFilter
});
// const DisplacementFilter = withFilters(Container, {
//   displacement: PIXI.filters.DisplacementFilter
//   // noise: PIXI.filters.NoiseFilter
//   // adjust: AdjustmentFilter
// });
const sprite = new PIXI.Sprite(PIXI.Texture.from("public/ppp.jpg"));

export const TColorOverlayFilter: React.FC<{
  color: number;
  alpha: FluidValue<number>;
}> = ({ children, color, alpha }) => {
  const [localAlpha, setLocalAlpha] = React.useState(() => getFluidValue(alpha));
  React.useEffect(() => {
    return watchFluidValue(alpha, (v) => setLocalAlpha(v));
  }, [alpha]);
  return (
    <ColorOverlayFilter2 colorOverlay={{ color, alpha: localAlpha }}>
      {children}
    </ColorOverlayFilter2>
  );
};

class DisplacementFilter extends PIXI.Container {
  brokenFilter: AmoyBrokenCamDistortionFilter;
  blurFilter: PIXI.filters.BlurFilter;
  blur: number;
  constructor(props: { x: FluidValue<number>; blur?: number }) {
    super();
    this.blur = props.blur ?? getFluidValue(props.x);
    this.filters = [
      (this.blurFilter = new PIXI.filters.BlurFilter(0)),
      (this.brokenFilter = new AmoyBrokenCamDistortionFilter({}))
    ];
    this.setFilterX = this.setFilterX.bind(this);
  }
  setFilterX(x: number) {
    // this.displacement.scale.x = x;
    // this.displacement.delta++
    this.brokenFilter.level = x;
    this.blurFilter.blurX = (x / this.blur) * 10;
    this.blurFilter.blurY = 0;
  }

  watch() {}
}

interface FilterProps<T extends PIXI.DisplayObject> {
  is: T;
  layout: AnimatedDisplayObjectProps<T>;
}

export function Filter<T extends PIXI.DisplayObject>(props: React.FC<FilterProps<T>>) {}

const TDisplacementFilter = CustomPixi(DisplacementFilter, {
  applyProps(instance, { x, ...oldProp }, { x: nextX, ...nextProp }) {
    applyDefaultProps(instance, oldProp, nextProp);
    // if (nextX instanceof FluidValue) {
    //   console.log("nextS");
    // }
    // React.useEffect(() => {
    //   return watchFluidValue(nextX, (v) => instance.setFilterX(v));
    // }, [nextX]);
    // if (x) removeFluidObserver(x, instance.setf);
    // if (nextX)
    // addFluidObserver(nextX, (on) => {
    //   const next = getFluidValue(nextX);
    //   typeof next === "number" && instance.setFilterX(next);
    // });
    if (x !== nextX) {
      if (instance._h) {
        instance._h();
        console.log("dispose watch");
      }
      instance._h = watchFluidValue(nextX, (v) => instance.setFilterX(v));
      console.log("next watch");
    }
  }
});

// export const TDisplacementFilter: React.FC<{ x }> = ({ children, x }) => {
//   const [localAlpha, setLocalAlpha] = React.useState(() => x.get());
//   React.useEffect(() => {
//     const handle = addFluidObserver(x, (on) => {
//       typeof on.value === "number" && setLocalAlpha(on.value);
//     });
//     return () => {
//       removeFluidObserver(x, handle);
//     };
//   }, [x]);
//   return (
//     <DisplacementFilter
//       displacement={{
//         construct: [sprite],
//         scale: { x: localAlpha, y: 0 } as PIXI.Point,
//         blendMode: PIXI.BLEND_MODES.ADD
//       }}
//     >
//       {children}
//     </DisplacementFilter>
//   );
// };

export { TDisplacementFilter };

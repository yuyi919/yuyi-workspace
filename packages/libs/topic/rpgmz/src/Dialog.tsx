import {
  Container,
  useApp,
  PixiComponent,
  applyDefaultProps,
  _ReactPixi
} from "@inlet/react-pixi/animated";
import { Flex, FlexBoxRenderProps } from "@plugins/react-pixijs/components";
import { animated, Spring, useSpring } from "@react-spring/web";
import { CSSProperties } from "@yuyi919/shared-types";
import React from "react";
import { FlexContainer } from "./FlexContainer";
import { DisplayObjectProps } from "@plugins/react-pixijs";
import { loadWithResource, SystemLoader, loadResources, ResourceIds } from "./SystemLoader";
import * as Core from "@yuyi919/rpgmz-core";
import Tween from "gsap";
import * as gsapHelper from "gsap";

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
export async function load() {
  for await (const item of loadResources(ResourceIds.DialogJson)) {
    console.log(item);
  }
  Core.Sprite;
  console.log(SystemLoader);
}
interface IDialogProps extends DisplayObjectProps<PIXI.Container> {}

function toScale(target: any) {
  const point = new PIXI.Point(0, 1);
}

class ContainerWrapper {
  constructor(public container: PIXI.Container) {}
  get alpha() {
    return this.container.alpha;
  }
  set alpha(value) {
    this.container.alpha = value;
  }

  get scale() {
    return this.scaleX;
  }
  set scale(value) {
    this.scaleX = value;
    this.scaleY = value;
  }

  get scaleX() {
    return this.container.scale.x;
  }
  set scaleX(value) {
    this.container.scale.x = value;
  }

  get scaleY() {
    return this.container.scale.y;
  }
  set scaleY(value) {
    this.container.scale.y = value;
  }
}

class CoreDialog extends PIXI.Container {
  back = new PIXI.Container();
  frame = new PIXI.Container();
  frameWrapper: ContainerWrapper;
  backWrapper: ContainerWrapper;
  frameRight: PIXI.Container;
  frameLeft: PIXI.Container;

  get scaleX() {
    return this.scale.x;
  }
  set scaleX(x) {
    this.scale.x = x;
  }

  constructor(public width: number, public height: number) {
    super();
    this.addChild(this.back);
    this.addChild(this.frame);

    const backWrapper = new ContainerWrapper(this.back);
    backWrapper.alpha = 0;
    backWrapper.scale = 0;

    const frameWrapper = new ContainerWrapper(this.frame);
    frameWrapper.alpha = 0;
    frameWrapper.scaleX = 0;
    this.frame.addChild((this.frameLeft = new PIXI.Container()));
    this.frame.addChild((this.frameRight = new PIXI.Container()));
    // const lef = 83 / 2
    // this.frameLeft.pivot.x = 0
    // this.frameLeft.x = lef

    this.backWrapper = backWrapper;
    this.frameWrapper = frameWrapper;

    requestAnimationFrame(() => {
      setTimeout(() => {
        const count = 0.7;
        Tween.to(backWrapper, {
          scale: 1,
          alpha: 1,
          duration: 0.3 * count,
          delay: 0.2 * count,
          ease: gsapHelper.Linear.easeIn
        });
        Tween.to(frameWrapper, {
          scaleX: 1,
          duration: 0.5 * count,
          ease: gsapHelper.Linear.easeOut
          // ease: gsapHelper.Elastic.easeOut
        });
        Tween.to(frameWrapper, {
          alpha: 1,
          duration: 0.5 * count
        });
      }, 200);
    });
  }

  updateSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.x += width / 2;
    this.y += height / 2;
    this.back.pivot.set(width / 2, height / 2);
    this.back.position.set(width / 2, height / 2);
    this.frame.pivot.set(width / 2, height / 2);
    this.frame.position.set(width / 2, height / 2);
  }

  destroy: PIXI.Container["destroy"] = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const { backWrapper, frameWrapper, frameLeft, frameRight } = this;
        const count = 0.7;
        Tween.to(backWrapper, {
          scaleX: 0,
          duration: 0.3 * count,
          alpha: 0 * count,
          ease: gsapHelper.Linear.easeIn
        });
        Tween.to(backWrapper, {
          scaleY: 0,
          duration: 0.3 * count,
          delay: 0.1 * count,
          ease: gsapHelper.Linear.easeOut
        });

        Tween.to(frameLeft, {
          x: this.width / 2 - 70,
          duration: 0.5 * count,
          ease: gsapHelper.Linear.easeOut
        });
        Tween.to(frameRight, {
          x: -(this.width / 2 - 70),
          duration: 0.5 * count,
          ease: gsapHelper.Linear.easeOut
        });

        Tween.to(frameWrapper, {
          scaleX: 0.2,
          duration: 0.5 * count,
          ease: gsapHelper.Linear.easeOut
        });
        Tween.to(frameWrapper, {
          scaleX: 0,
          scaleY: 0,
          alpha: 0,
          duration: 0.2 * count,
          delay: 0.5 * count,
          ease: gsapHelper.Linear.easeOut
        }).then(() => {
          super.destroy({ children: true });
        });
      }, 200);
    });
  };
}
// let _emptyBaseTexture: PIXI.BaseTexture;

function hackDestory(target: PIXI.DisplayObject, parent: PIXI.Container = target.parent) {
  const newP = new PIXI.Container();
  const childIndex = parent.getChildIndex(target);
  console.log("willUnmount", target);
  newP.addChild(target);
  parent.addChildAt(newP, childIndex);
}

export const enum BackParts {
  TopLeft,
  TopCenter,
  TopRight,
  MiddleLeft,
  MiddleCenter,
  MiddleRight,
  BottomLeft,
  BottomCenter,
  BottomRight
}
export const enum FrameParts {
  TopLeft,
  TopRight,
  MiddleLeft,
  MiddleRight,
  BottomLeft,
  BottomRight
}
export const BaseDialog = PixiComponent("Dialog", {
  create({ width, height }: IDialogProps) {
    // // const sprite = new Core.Sprite()
    // // sprite.bitmap
    // const empty =
    //   _emptyBaseTexture ||
    //   ((_emptyBaseTexture = new PIXI.BaseTexture()), _emptyBaseTexture.setSize(1, 1));
    // const frame = new PIXI.Rectangle();
    // const container = new PIXI.Sprite(new PIXI.Texture(empty, frame));
    const container = new CoreDialog(width, height);
    // container.children[1].y = -3;
    return container;
  },
  applyProps(
    container: CoreDialog,
    { width: prevWidth, height: prevHeight, ...otherOldProps },
    { width, height, ...otherNewProps }
  ) {
    applyDefaultProps(container, otherOldProps, otherNewProps);
    for (const { name, texture } of loadWithResource(ResourceIds.DialogJson)) {
      console.log(name, texture);
      // container.addChild(res.texture)
      if (name === ResourceIds.DialogBack) {
        const frameWidth = texture.frame.width;
        const frameHeight = texture.frame.height;
        const backWidth = width;
        const backHeight = height - 12;
        const w = frameWidth / 3;
        const h = frameHeight / 3;
        const right = backWidth - w;
        const bottom = backHeight - h;
        for (let hi = 0; hi < 3; hi++) {
          for (let wi = 0; wi < 3; wi++) {
            const childIndex = hi * 3 + wi;
            let rocket: PIXI.Sprite = container.back.children[childIndex] as PIXI.Sprite;
            if (rocket) {
              rocket.texture.frame.x = texture.frame.x + wi * w;
              rocket.texture.frame.y = texture.frame.y + hi * h;
              rocket.texture.frame.width = w;
              rocket.texture.frame.height = h;
            } else {
              const _texture = texture.clone();
              _texture.trim = null;
              const rectangle = new PIXI.Rectangle(
                texture.frame.x + wi * w,
                texture.frame.y + hi * h,
                w,
                h
              );
              _texture.frame = rectangle;

              rocket = new PIXI.TilingSprite(_texture);
              container.back.addChildAt(rocket, childIndex);
              rocket.blendMode = PIXI.BLEND_MODES.SCREEN;
            }

            const partX = wi === 2 ? right : wi * w;
            const partY = hi === 2 ? bottom : hi * h;
            const partWidth = wi === 1 ? Math.max(backWidth - w * 2, 0) : w;
            const partHeight = hi === 1 ? Math.max(backHeight - h * 2, 0) : h;
            const partScaleX = 1;
            const partScaleY = 1;
            // const graphics = new PIXI.Graphics();
            // graphics.beginFill(0x000000);
            // graphics.drawRoundedRect(partX, partY, partWidth, partHeight, 6);
            // graphics.endFill();
            // container.addChild(graphics);
            //Tell the texture to use that rectangular section

            //Create the sprite from the texture
            //Position the rocket sprite on the canvas
            rocket.x = partX;
            rocket.y = partY;
            rocket.width = partWidth;
            rocket.height = partHeight;
            rocket.scale.set(partScaleX, partScaleY);
            // console.log(name, partX, partY, rocket.width, rocket.height);
          }
        }
        // container.children[0].width = backWidth
        // container.children[0].height = backHeight
      } else if (name === ResourceIds.DialogFrame) {
        const frameWidth = texture.frame.width;
        const frameHeight = texture.frame.height;
        const w = frameWidth;
        const h = frameHeight / 3;
        const bottom = height - h;
        // const x_offset = 14;
        for (let hi = 0; hi < 3; hi++) {
          for (let wi = 0; wi < 2; wi++) {
            const frameGroup = container.frame.getChildAt(wi) as PIXI.Container;
            let rocket: PIXI.Sprite;
            if (frameGroup.children[hi]) {
              rocket = frameGroup.children[hi] as PIXI.TilingSprite;
              rocket.texture.frame.y = texture.frame.y + hi * h;
              rocket.texture.frame.width = w;
              rocket.texture.frame.height = h;
            } else {
              const _texture = texture.clone();
              if (_texture.trim) {
                _texture.trim = null;
              }
              const rectangle = new PIXI.Rectangle(texture.frame.x, texture.frame.y + hi * h, w, h);
              _texture.frame = rectangle;

              rocket = new PIXI.TilingSprite(_texture);
              frameGroup.addChildAt(rocket, hi);
              rocket.blendMode = PIXI.BLEND_MODES.SCREEN;
            }

            const partX = wi === 1 ? width + 14 : -14;
            const partY = hi === 2 ? bottom : hi * h;
            const partHeight = hi === 1 ? Math.max(height - h * 2, 0) : h;
            const partScaleX = wi === 1 ? -1 : 1;
            const partScaleY = 1;
            // const graphics = new PIXI.Graphics();
            // graphics.beginFill(0x000000);
            // graphics.drawRoundedRect(partX, partY, partWidth, partHeight, 6);
            // graphics.endFill();
            // container.addChild(graphics);
            //Tell the texture to use that rectangular section

            //Create the sprite from the texture
            //Position the rocket sprite on the canvas
            rocket.x = partX;
            rocket.y = partY - 6;
            rocket.width = w;
            rocket.height = partHeight;
            rocket.scale.set(partScaleX, partScaleY);
            console.log(name, partX, partY, rocket.width, rocket.height);
          }
        }
        function setX(x_offset: number) {
          const rocket = new PIXI.Sprite(texture);
          rocket.x = -x_offset;
          rocket.y = -6;
          const rocket2 = new PIXI.Sprite(texture);
          rocket2.x = width - x_offset;
          rocket2.y = -6;
          rocket2.scale.x = -1;
          container.addChild(rocket);
          container.addChild(rocket2);
        }
      }
    }
    container.updateSize(width, height);
    console.log(container);
  },
  config: {
    destroy: false,
    destroyChildren: false
  },
  willUnmount(container: CoreDialog, parent) {
    hackDestory(this, parent);
    container.destroy();
  }
});
const Dialog: React.FC<IDialogProps> = ({ x, y, width, height, ...other }) => {
  const app = useApp();
  const [loaded, setLoaded] = React.useState(true);
  const [localWidth, setWidth] = React.useState(width);
  const [localHeight, setHeight] = React.useState(height);
  React.useEffect(() => {
    // setTimeout(() => {
    //   setLoaded(false);
    // }, 2000);
  }, []);
  const poivot = React.useMemo(
    () => ({ x: localWidth / 2, y: localHeight / 2 }),
    [localWidth, localHeight]
  );
  return (
    <Container
      interactive
      pointerup={() => {
        setWidth((x) => x - 80);
        setHeight((y) => y - 40);
      }}
      pointerout={() => {
        setLoaded(false);
      }}
    >
      {loaded && (
        <BaseDialog
          pivot={poivot}
          x={x - poivot.x}
          y={y - poivot.y}
          width={localWidth}
          height={localHeight}
        ></BaseDialog>
      )}
    </Container>
  );
};
Dialog.defaultProps = {
  x: 10,
  y: 10,
  width: 330,
  height: 120
};
export default Dialog;

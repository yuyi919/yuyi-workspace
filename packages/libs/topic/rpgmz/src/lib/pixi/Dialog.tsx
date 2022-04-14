import {
  Container,
  useApp,
  Stage,
  AppConsumer,
  applyDefaultProps,
  Sprite,
  _ReactPixi
} from "@inlet/react-pixi/animated";
import { Flex, FlexBoxRenderProps } from "@plugins/react-pixijs/components";
import { animated, Spring, useSpring } from "@react-spring/web";
import React from "react";
import { FlexContainer } from "./FlexContainer";
import { DisplayObjectProps } from "@plugins/react-pixijs";
import { loadWithResource, ResourceIds } from "../SystemLoader";
import Tween from "gsap";
import * as gsapHelper from "gsap";
import { CustomPixi } from "../utils";
import { Dragging } from "./Dragging";
interface IDialogProps extends DisplayObjectProps<PIXI.Container> {}

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

  constructor(public width: number, public height: number) {
    super();
    this.addChild(this.frame);
    this.addChild(this.back);

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
    // if (this.mask) {
    //   this.back.calculateBounds();
    //   const mask = this.mask;
    //   ((mask as PIXI.MaskData).maskObject as PIXI.Graphics).width = this.frame.width;
    //   ((mask as PIXI.MaskData).maskObject as PIXI.Graphics).height = this.frame.height;
    //   // (mask as PIXI.Sprite).width = this.frame.width;
    //   // (mask as PIXI.Sprite).height = this.frame.height;
    // } else {
    //   const mask = this.createMask(width, height);
    //   console.log(mask);
    //   this.mask = mask;
    //   this.hitArea = new PIXI.Rectangle(0, 0, width, height);
    // }
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
          x: this.frame.width / 2 - 70,
          duration: 0.5 * count,
          ease: gsapHelper.Linear.easeOut
        });
        Tween.to(frameRight, {
          x: -(this.frame.width / 2 - 70),
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
          this.mask = null;
        });
      }, 200);
    });
  };

  private createMask(width: number, height: number) {
    const rect = new PIXI.Graphics();
    rect.beginFill(0xffffff, 1);
    const radius = 5,
      blurSize = 32;
    if (radius) {
      rect.drawRoundedRect(0, 0, width, height, radius);
    } else {
      rect.drawRect(0, 0, width, height);
    }
    rect.endFill();
    rect.filters = [new PIXI.filters.BlurFilter(blurSize)];
    // const { app } = globalThis;
    // console.log(app);
    // const bounds = new PIXI.Rectangle(0, 0, width / 2, width / 2);
    // const texture = app.renderer.generateTexture(rect, PIXI.SCALE_MODES.NEAREST, 1, bounds);
    // const focus = new PIXI.Sprite(texture);
    // this.addChild(focus);

    const mask = new PIXI.MaskData(rect);
    mask.type = PIXI.MASK_TYPES.SCISSOR;
    mask.autoDetect = false;
    this.addChild(rect);
    return mask;
    // return focus;
  }
}
// let _emptyBaseTexture: PIXI.BaseTexture;

export const BaseDialog = CustomPixi("Dialog", {
  create({ width, height }: IDialogProps) {
    console.log(this);
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
    console.log(container, otherOldProps, otherNewProps);
    for (const { name, texture } of loadWithResource(ResourceIds.DialogJson)) {
      // console.log(name, texture);
      // container.addChild(res.texture)
      if (name === ResourceIds.DialogBack) {
        const frameWidth = texture.frame.width;
        const frameHeight = texture.frame.height;
        // const backWidth = width;
        // const backHeight = height - 12;
        // const w = frameWidth / 3;
        // const h = frameHeight / 3;
        // const right = backWidth - w;
        // const bottom = backHeight - h;
        // for (let hi = 0; hi < 3; hi++) {
        //   for (let wi = 0; wi < 3; wi++) {
        //     const childIndex = hi * 3 + wi;
        //     let rocket: PIXI.Sprite = container.back.children[childIndex] as PIXI.Sprite;
        //     if (rocket) {
        //       rocket.texture.frame.x = texture.frame.x + wi * w;
        //       rocket.texture.frame.y = texture.frame.y + hi * h;
        //       rocket.texture.frame.width = w;
        //       rocket.texture.frame.height = h;
        //     } else {
        //       const _texture = texture.clone();
        //       _texture.trim = null;
        //       const rectangle = new PIXI.Rectangle(
        //         texture.frame.x + wi * w,
        //         texture.frame.y + hi * h,
        //         w,
        //         h
        //       );
        //       _texture.frame = rectangle;

        //       rocket = new PIXI.TilingSprite(_texture);
        //       container.back.addChildAt(rocket, childIndex);
        //       rocket.blendMode = PIXI.BLEND_MODES.SCREEN;
        //     }

        //     const partX = wi === 2 ? right : wi * w;
        //     const partY = hi === 2 ? bottom : hi * h;
        //     const partWidth = wi === 1 ? Math.max(backWidth - w * 2, 0) : w;
        //     const partHeight = hi === 1 ? Math.max(backHeight - h * 2, 0) : h;
        //     const partScaleX = 1;
        //     const partScaleY = 1;
        //     // const graphics = new PIXI.Graphics();
        //     // graphics.beginFill(0x000000);
        //     // graphics.drawRoundedRect(partX, partY, partWidth, partHeight, 6);
        //     // graphics.endFill();
        //     // container.addChild(graphics);
        //     //Tell the texture to use that rectangular section

        //     //Create the sprite from the texture
        //     //Position the rocket sprite on the canvas
        //     rocket.x = partX;
        //     rocket.y = partY + 6;
        //     rocket.width = partWidth;
        //     rocket.height = partHeight;
        //     rocket.scale.set(partScaleX, partScaleY);
        //     // console.log(name, partX, partY, rocket.width, rocket.height);
        //   }
        // }
        // container.children[0].width = backWidth
        // container.children[0].height = backHeight

        const w = frameWidth / 4;
        const h = frameHeight / 4;

        let back = container.back.children[0] as PIXI.NineSlicePlane;
        if (back) {
          back.rightWidth = back.leftWidth = w;
          back.topHeight = back.bottomHeight = h;
        } else {
          back = new PIXI.NineSlicePlane(texture, w, h, w, h);
          container.back.addChildAt(back, 0);
          // back.blendMode = PIXI.BLEND_MODES.SCREEN;
          back.zIndex = 0;
        }
        back.width = width;
        back.height = height;
      } else if (name === ResourceIds.DialogFrame) {
        const frameWidth = texture.frame.width;
        const frameHeight = texture.frame.height;
        const w = frameWidth / 2.5;
        const h = frameHeight / 2.5;

        for (let i = 0; i < 2; i++) {
          const frameGroup = container.frame.getChildAt(i) as PIXI.Container;
          let frame: PIXI.NineSlicePlane;
          if (frameGroup.children[0]) {
            frame = frameGroup.children[0] as PIXI.NineSlicePlane;
            frame.rightWidth = frame.leftWidth = w;
            frame.topHeight = frame.bottomHeight = h;
          } else {
            frame = new PIXI.NineSlicePlane(texture, w, h, w, h);
            frameGroup.addChild(frame);
            // frame.blendMode = PIXI.BLEND_MODES.SCREEN;
            frame.alpha = 0.8;
            frame.zIndex = 1;
          }
          const partX = i === 1 ? width + 14 : -14;
          frame.width = width / 4;
          frame.height = height + 12;
          frame.x = partX;
          frame.pivot.y = 6;
          frame.scale.x = i === 1 ? -1 : 1;
        }
        // const x_offset = 14;
        //   for (let hi = 0; hi < 3; hi++) {
        //     for (let wi = 0; wi < 2; wi++) {
        //       const frameGroup = container.frame.getChildAt(wi) as PIXI.Container;
        //       let rocket: PIXI.Sprite;
        //       if (frameGroup.children[hi]) {
        //         rocket = frameGroup.children[hi] as PIXI.TilingSprite;
        //         rocket.texture.frame.y = texture.frame.y + hi * h;
        //         rocket.texture.frame.width = w;
        //         rocket.texture.frame.height = h;
        //       } else {
        //         const _texture = texture.clone();
        //         if (_texture.trim) {
        //           _texture.trim = null;
        //         }
        //         const rectangle = new PIXI.Rectangle(texture.frame.x, texture.frame.y + hi * h, w, h);
        //         _texture.frame = rectangle;

        //         rocket = new PIXI.TilingSprite(_texture);
        //         frameGroup.addChildAt(rocket, hi);
        //         rocket.blendMode = PIXI.BLEND_MODES.SCREEN;
        //       }

        //       const partX = wi === 1 ? width + 14 : -14;
        //       const partY = hi === 2 ? bottom : hi * h;
        //       const partHeight = hi === 1 ? Math.max(height - h * 2, 0) : h;
        //       const partScaleX = wi === 1 ? -1 : 1;
        //       const partScaleY = 1;
        //       // const graphics = new PIXI.Graphics();
        //       // graphics.beginFill(0x000000);
        //       // graphics.drawRoundedRect(partX, partY, partWidth, partHeight, 6);
        //       // graphics.endFill();
        //       // container.addChild(graphics);
        //       //Tell the texture to use that rectangular section

        //       //Create the sprite from the texture
        //       //Position the rocket sprite on the canvas
        //       rocket.x = partX;
        //       rocket.y = partY;
        //       rocket.width = w;
        //       rocket.height = partHeight;
        //       rocket.scale.set(partScaleX, partScaleY);
        //       // console.log(name, partX, partY, rocket.width, rocket.height);
        //     }
        //   }
      }
    }
    container.updateSize(width, height);
    applyDefaultProps(container, otherOldProps, otherNewProps);
    console.log(container.scale);
  }
});

export const Dialog: React.FC<IDialogProps> = ({
  x,
  y,
  width,
  height,
  children,
  ref,
  mask,
  transform,
  ...other
}) => {
  globalThis.app = useApp();
  const [loaded, setLoaded] = React.useState(true);
  const [localWidth, setWidth] = React.useState(width);
  const [localHeight, setHeight] = React.useState(height);
  const [scale, setScale] = React.useState(100);
  React.useEffect(() => {
    // setTimeout(() => {
    //   setLoaded(false);
    // }, 2000);
    // if (coreRef.current) {
    //   coreRef.current.enableDrag();
    // }
    // return () => {
    //   if (coreRef.current) {
    //     coreRef.current.disableDrag();
    //   }
    // };
  }, []);
  const events = React.useMemo(() => ({}), []);
  const poivot = React.useMemo(
    () => ({ x: localWidth / 2, y: localHeight / 2 }),
    [localWidth, localHeight]
  );
  const coreRef = React.useRef<CoreDialog>();
  return (
    <Container
      interactive
      x={x}
      y={y}
      {...other}
      pointerup={() => {
        setWidth((x) => x + 80);
        setHeight((y) => y + 40);
        // setScale((x) => x + 10);
      }}
      pointerout={() => {}}
      pointertap={(e) => {
        console.log(e.target, e.currentTarget);
        // setLoaded(false);
      }}
    >
      {/* <Container x={-localWidth} y={-localHeight*2}>
        <AppConsumer>{(app) => <Plane app={app} />}</AppConsumer>
      </Container> */}
      {false && (
        <Sprite
          anchor={0.5}
          width={localWidth}
          height={localHeight}
          texture={PIXI.Texture.WHITE}
          tint={0xaddb67}
        />
      )}
      {/* 
      {loaded && (
        <BaseDialog
          x={-localWidth}
          y={0}
          pivot={poivot}
          scale={scale / 100}
          width={localWidth}
          height={localHeight}
        ></BaseDialog>
      )} */}
      {loaded && (
        <Dragging>
          <BaseDialog
            interactive
            ref={coreRef}
            x={0}
            y={0}
            pivot={poivot}
            scale={scale / 100}
            width={localWidth}
            height={localHeight}
          >
            {/* <InfoWindow x={-100} width={localWidth} height={localHeight}></InfoWindow> */}
            <Sprite x={0} y={0} width={2} height={2} texture={PIXI.Texture.WHITE} tint={0xaddb67} />
          </BaseDialog>
        </Dragging>
      )}
      {/* <Sprite
        anchor={0.5}
        width={localWidth}
        height={localHeight}
        texture={PIXI.Texture.WHITE}
        tint={0xaddb67}
      /> */}
    </Container>
  );
};
Dialog.defaultProps = {
  x: 10,
  y: 10,
  width: 330,
  height: 120
};

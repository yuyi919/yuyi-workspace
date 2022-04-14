import {
  Text,
  Container,
  ParticleContainer,
  Sprite,
  NineSlicePlane,
  TilingSprite
} from "@inlet/react-pixi/animated";
import { AnimatedDisplayObjectProps } from "@plugins/react-pixijs";
import {
  useTrail,
  Spring,
  useChain,
  to,
  useSpring,
  useTransition,
  useSpringRef
} from "@react-spring/web";
import { requestAnimateFrame } from "@yuyi919/rpgmz-plugins/src/react-pixijs/scroll/utils";
import React from "react";
import { FontFamily, loadWithResource, ResourceIds, SystemLoader } from "../SystemLoader";
import { Sound } from "../utils";

import Tween from "gsap";
import { TColorOverlayFilter } from "./filters";
interface ISetupMenuProps extends AnimatedDisplayObjectProps<PIXI.Container> {}

export const SetupMenu: React.FC<ISetupMenuProps> = ({
  x,
  y,
  width,
  height,
  mask,
  children,
  ...other
}) => {
  const [localWidth, setWidth] = React.useState(width);
  const [localHeight, setHeight] = React.useState(height);
  const poivot = React.useMemo(
    () =>
      to([width, height], (width, height) => ({
        x: width / 2,
        y: height / 2
      })),
    [width, height]
  );
  const data: IButtonProps[] = [
    { index: 0, text: "装备", label: "E" },
    { index: 1, text: "开发", label: "C" },
    { index: 2, text: "保存", label: "SAVE" },
    { index: 3, text: "读取", label: "LOAD" },
    { index: 4, text: "设置", label: "SETUP" },
    { index: 5, text: "回到标题", label: "TITLE" }
  ];
  // const barHeight = 120;
  const springRef1 = useSpringRef();
  const inter2 = useTrail(data.length, {
    from: { alpha: 1 },
    to: { alpha: 0 },
    ref: springRef1,
    onChange: (e) => {
      // console.log(e.value)
    },
    config: { mass: 1, tension: 1000, friction: 30 }
  });
  const springRef2 = useSpringRef();
  const inter = useTransition(data, {
    from: {
      alpha: 0
    },
    enter: {
      alpha: 1
    },
    config: (item, index, phase) => (key) => ({ duration: 1000 }),
    ref: springRef2
  });

  // inter();
  // useChain([springRef2, springRef1], [0, 1, 1]);
  React.useLayoutEffect(() => {
    console.log("play");
    Sound.play("SystemSE_MainMenu", {
      singleInstance: true
    });
    // setTimeout(() => {
    // Sound.play("SystemSE_MainMenu");
    // AudioManager.playSe({name:"bsd/SystemSE_MainMenu", volume: 100,pitch: 100 })
    // }, 1000);
    return;
  }, []);
  return (
    <Container x={x} y={y} {...other}>
      {/* <NineSlicePlane
        pivot={poivot}
        width={localWidth}
        height={localHeight}
        leftWidth={11}
        rightWidth={11}
        topHeight={11}
        drawMode={PIXI.DRAW_MODES.POINTS}
        bottomHeight={11}
        texture={loadWithResource(ResourceIds.DialogJson, ResourceIds.InfoWindowFrame)}
      ></NineSlicePlane> */}
      <Main y={to(localHeight, (localHeight) => localHeight / 2)} width={localWidth} height={120}>
        <Container anchor={0.5}>
          {/* {inter((x, data) => (
            <Button key={data.label} x={data.index * 35} alpha={x.alpha} {...data} />
          ))} */}
          <Container
            y={-(100 * 1.2) / 2}
            pivot={[(100 * 1.2 + (data.length - 1) * 35 * 1.2) / 2, 0]}
          >
            {inter2.map(({ alpha }, index) => (
              <TColorOverlayFilter
                key={data[index].label}
                {...{
                  color: 0xffffff,
                  alpha: alpha
                }}
              >
                <Button scale={[1.2, 1.2]} x={index * 35 * 1.2} {...data[index]} />
              </TColorOverlayFilter>
            ))}
          </Container>
          {/* <Sprite anchor={0.5} texture={PIXI.Texture.WHITE} width={140} height={23} /> */}
        </Container>
      </Main>
    </Container>
  );
};

SetupMenu.defaultProps = {
  x: 0,
  y: 0,
  width: 1280,
  height: 720
};

// const Filters = withFilters(Container, {
//   blur: PIXI.filters,
//   // noise: PIXI.filters.NoiseFilter
//   // adjust: AdjustmentFilter
// });
const StyleText = React.forwardRef<PIXI.Text, AnimatedDisplayObjectProps<PIXI.Text>>(
  (props, ref) => {
    const [width, setWidth] = React.useState(true);
    React.useEffect(() => {
      const i = requestAnimateFrame(() => {
        setWidth((width) => !width);
      });
      return () => cancelAnimationFrame(i);
    });
    return <Text isSprite={false} {...props} ref={ref} />;
  }
);

export const Flash: React.FC<{
  enabled: boolean;
  duration: number;
  stopOnDestroy?: boolean | number;
  startAt?: number;
  endAt?: number;
}> = ({ children, enabled, duration, stopOnDestroy = true, startAt, endAt }) => {
  const ref = React.useRef<PIXI.DisplayObject | PIXI.Container>();
  React.useEffect(() => {
    if (enabled) {
      const timeline = Tween.to(ref.current, {
        alpha: endAt ?? 1,
        startAt: {
          alpha: startAt ?? 0
        },
        duration: duration / 1000,
        onComplete() {
          timeline.reverse();
        },
        onReverseComplete() {
          timeline.restart();
        }
      }).progress(0.9);
      return () => {
        if (stopOnDestroy || stopOnDestroy === 0) {
          const time = stopOnDestroy === true ? 0 : stopOnDestroy;
          timeline.pause(time);
          Tween.to(ref.current, { alpha: 0, duration: 0.3 }).kill();
        }
      };
    }
  }, [ref.current, children]);
  return React.isValidElement(children) ? (
    React.cloneElement(children, { ref })
  ) : (
    <Container ref={ref as React.RefObject<PIXI.Container>}>{children}</Container>
  );
};

export interface IButtonProps
  extends AnimatedDisplayObjectProps<PIXI.Container, {}, "x" | "y" | "alpha"> {
  index: number;
  text: string;
  label: string;
}

const Button: React.FC<IButtonProps> = ({ text, label, ...props }) => {
  const [width, setWidth] = React.useState([0, 0]);
  const hit = React.useRef<PIXI.Sprite>();
  const mask = React.useRef<PIXI.Sprite>();
  const [hover, setHover] = React.useState(false);
  const style = new PIXI.TextStyle({
    fontFamily: "微软雅黑",
    fill: 0xffffff,
    align: "center",
    fontSize: 16
    // fontWeight: "bold"
    // strokeThickness: 5,
  });
  React.useEffect(() => {
    const text = new PIXI.Text("aaa", style);
    // console.log(
    //   new PIXI.Sprite(loadWithResource(ResourceIds.DialogJson, ResourceIds.SetupMenuMainBtn1))
    //     .roundPixels
    // );
    setWidth([text.width, text.height]);
  }, [text]);
  React.useEffect(() => {
    if (hover) {
      Sound.play("SystemSE_Cursor", { singleInstance: true });
    }
    return;
  }, [hover]);
  return (
    <Container {...props} angle={-45}>
      <Sprite
        anchor={0.5}
        y={70.5}
        x={-0.5}
        ref={mask}
        texture={PIXI.Texture.WHITE}
        width={140}
        height={23}
      />
      <Sprite
        angle={45}
        buttonMode
        interactive
        interactiveChildren={false}
        mask={mask.current}
        pointerover={() => {
          setHover(true);
        }}
        pointerout={() => {
          setHover(false);
        }}
        texture={loadWithResource(ResourceIds.DialogJson, ResourceIds.SetupMenuMainBtn4)}
      />
      {/* <Sprite
        ref={hit}
        angle={45}
        alpha={1}
        texture={loadWithResource(ResourceIds.DialogJson, ResourceIds.SetupMenuMainBtn4)}
      ></Sprite> */}
      <Flash enabled={hover} duration={50} endAt={0.6}>
        <Sprite
          anchor={0.5}
          mask={mask.current}
          angle={45}
          y={70.5}
          x={0}
          alpha={0}
          texture={PIXI.Texture.WHITE}
          width={100}
          height={100}
        />
      </Flash>
      {/* </Spring> */}
      {/* <Sprite
        angle={45}
        mask={hit.current}
        texture={loadWithResource(ResourceIds.DialogJson, ResourceIds.SetupMenuMainBtn2)}
      ></Sprite> */}
      <Container x={0} y={71}>
        <Text
          text={label}
          style={
            new PIXI.TextStyle({
              fontFamily: FontFamily.Transistor,
              fill: 0x000000,
              align: "center",
              fontSize: 20,
              fontWeight: "bold",
              letterSpacing: 60 / label.length
            })
          }
          alpha={0.1}
          anchor={0.5}
        />
        <Text text={text} style={style} y={-1} anchor={0.5} />
        <Spring
          to={
            hover
              ? {
                  offset: 0,
                  alpha: 1,
                  scale: 1
                }
              : {
                  offset: 50,
                  alpha: 0,
                  scale: 1.5
                }
          }
          config={{ mass: 1, tension: 1700, friction: 100 }}
        >
          {({ offset, alpha, scale }) => {
            const style = new PIXI.TextStyle({
              fontFamily: FontFamily.ProFontForPowerline,
              fill: 0x000000,
              align: "center",
              fontSize: 18,
              // letterSpacing: 40 / label.length,
              fontWeight: "bold",
              lineHeight: 10
              // strokeThickness: 1
            });
            const data = {
              text: label,
              style,
              anchor: 0.5,
              alpha,
              y: 1
              // scale: scale
            };
            return (
              <Flash enabled={hover} stopOnDestroy={400} duration={400} startAt={0.3} endAt={1}>
                <StyleText x={offset.to((o) => -o)} {...data} />
                <StyleText x={offset} {...data} />
              </Flash>
            );
          }}
        </Spring>
      </Container>
    </Container>
  );
};

interface IMainProps
  extends AnimatedDisplayObjectProps<PIXI.Container, {}, "x" | "y" | "width" | "height"> {}
const Main: React.FC<IMainProps> = ({
  width: localWidth,
  height: localHeight,
  children,
  ...other
}) => {
  const scaleY = 1.2;
  const springRef1 = useSpringRef();
  const inter1 = useSpring({
    from: {
      scaleY: 0
      // alpha: 0
    },
    to: {
      scaleY: scaleY
      // alpha: 0
    },
    config: { mass: 5, tension: 1000, friction: 100 },
    ref: springRef1
  });
  const springRef2 = useSpringRef();
  const inter = useSpring({
    from: {
      alpha: 0.9
    },
    to: {
      alpha: 0
    },
    config: { mass: 1, tension: 500, friction: 100 },
    ref: springRef2
  });
  useChain([springRef1, springRef2], [0, 0.2]);
  return (
    <Container
      {...other}
      scale={inter1.scaleY.to((scaleY) => [1, scaleY])}
      pivot={to([inter1.scaleY, localHeight], (scaleY, localHeight) => [0, localHeight / 2])}
    >
      <TilingSprite
        tilePosition={0}
        width={localWidth}
        height={to(localHeight, (localHeight) => localHeight)}
        texture={loadWithResource(ResourceIds.DialogJson, ResourceIds.SetupMenuBarBack)}
      />
      <Container
        x={to(localWidth, (localWidth) => localWidth / 2)}
        y={to([localHeight, inter1.scaleY], (localWidth, scaleY) => localWidth / 2)}
        scale={inter1.scaleY.to((scaleY) => [1, scaleY > 1 ? 1 / scaleY : 1])}
      >
        {children}
      </Container>
      <Sprite
        alpha={inter.alpha}
        blendMode={PIXI.BLEND_MODES.ADD}
        width={to(localWidth, (localWidth) => localWidth + 1)}
        height={to(localHeight, (localHeight) => localHeight)}
        texture={
          PIXI.Texture.WHITE //loadWithResource(ResourceIds.DialogJson, ResourceIds.SetupMenuFlash)
        }
      />
    </Container>
  );
};

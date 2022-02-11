import {
  Sprite,
  AppProvider,
  Container,
  render,
  unmountComponentAtNode,
  PixiComponent,
  applyDefaultProps,
  _ReactPixi,
  Text,
  Graphics,
} from "@inlet/react-pixi/animated";
import { AnimatedProps } from "react-spring";

import * as PIXI from "pixi.js";
import React from "react";
import { Spring } from "react-spring";
import { Types } from "@yuyi919/shared-types";
import { App } from "./app";
import { addUpdater, removeUpdater, useUpdater } from "./hooks";
import { Flex, FlexBox, YogaProvider } from "./yoga-grid";
import PixiBetterScroller from "./scroll";
import { gradient } from "./utils";

// 补充遗漏的定义
declare module "@inlet/react-pixi/animated" {
  // unmount component
  export const unmountComponentAtNode: (container: PIXI.Container) => void;
}

type FilterPropsKeys<T, U> = {
  // 移除内部字段(_开头)
  [key in keyof T]: key extends `_${string}` ? never : T[key] extends U ? never : key;
}[keyof T];

type FixProps<T, U> = AnimatedProps<Pick<T, FilterPropsKeys<T, U>>>;

export type DisplayObjectProps<T extends PIXI.DisplayObject = PIXI.DisplayObject> = FixProps<
  _ReactPixi.Container<T, {}>,
  Types.Function.Base
>;

export function Window(app: globalThis.PIXI.Application, parent = app.stage) {
  const config = {
    size: { width: 1280, height: 720 },
    spring: { mass: 10, tension: 1000, friction: 100 },
    stage: { antialias: true, backgroundColor: 0xff0ff0 },
  };
  console.log(config);
  const set = () => ({
    x: Math.random() * config.size.width,
    y: Math.random() * config.size.height,
    rotation: Math.random() * 10,
    scale: Math.max(1, Math.random() * 10),
  });
  const Box = ({ children, ...props }: any) => (
    <Spring to={props} config={config.spring}>
      {children instanceof Function ? children : (props) => React.cloneElement(children, props)}
    </Spring>
  );
  const Main2 = () => {
    const [transform, setTransform] = React.useState(set);
    React.useEffect(() => {
      const handle = () => {
        // setTransform(set);
      };
      window.addEventListener("click", handle);
      return () => {
        window.removeEventListener("click", handle);
      };
    }, []);
    return (
      <Container
        {...config.size}
        pointerup={() => {
          setTransform(set);
        }}
      >
        <Box {...transform} pointerup={() => setTransform(set)}>
          <App />
        </Box>
      </Container>
    );
  };
  const Button = PixiComponent("Button", {
    create: (props: _ReactPixi.IContainer) => {
      const button = new globalThis.Sprite_Button("menu");
      addUpdater(button.update, button);
      return button;
    },
    applyProps: (instance: globalThis.Sprite_Button, oldProps, newProps) => {
      // apply rest props to PIXI.Text
      console.log("applyProps", oldProps, newProps, instance);
      const { pointerup, click, mouseup, ...other } = newProps;
      applyDefaultProps(instance, oldProps, other);
      instance.setClickHandler(() => {
        console.log("setClickHandler");
        pointerup?.(null);
        click?.(null);
        mouseup?.(null);
      });
      // set new count
      // instance.text = count.toString();
    },
    didMount(instance, parent) {
      console.log("parent", parent);
      // app.ticker.add(button.update, button);
    },
    willUnmount(instance, parent) {
      removeUpdater(instance.update);
      console.log("unmount");
    },
  });
  type TextStyle = (typeof PIXI.TextStyle extends new (...args: infer Args) => any ? Args : [])[0];
  const StyledButton: React.FC<
    DisplayObjectProps<PIXI.Container> & { textStyle?: TextStyle; text: string }
  > = (props) => {
    const textRef = React.useRef<PIXI.Text>();
    const draw = React.useCallback(
      (ellipse: PIXI.Graphics) => {
        // 椭圆
        ellipse.beginTextureFill({
          texture: gradient("#3BC1E3", "#FFF"),
        });
        ellipse.drawEllipse(0, 0, 160, 20);
        ellipse.endFill();
        ellipse.alpha = 0.5;
      },
      [props]
    );
    const [d, setDeltaTime] = React.useState(0);
    const { children, textStyle, text, ...other } = props;
    const textStyles = React.useMemo<TextStyle>(
      () => ({
        fill: "white",
        fontFamily:
          "-apple-system,PingFang SC,Helvetica Neue,STHeiti,Microsoft Yahei,Tahoma,Simsun,sans-serif;",
        fontSize: 45,
        stroke: "#2b3f56",
        strokeThickness: 8,
        ...textStyle,
      }),
      [textStyle]
    );
    React.useEffect(() => {
      console.log(textRef);
    }, []);
    useUpdater((d) => {
      setDeltaTime(d);
    });
    return (
      <Container {...other}>
        <Graphics anchor={[0.5, 0.5]} draw={draw} />
        <Text ref={textRef} anchor={[0.5, 0.5]} text={text} style={textStyles} />
      </Container>
    );
  };
  const ScrollerContainer = PixiComponent("ScrollerContainer", {
    create(props: DisplayObjectProps<PIXI.Container>) {
      return new PixiBetterScroller({
        width: 500,
        height: 500,
        onScroll(pos) {
          // console.log("scroll", pos);
        },
        onBounce(direction, back) {
          // console.log("onBounce", direction);
          back();
        },
      }).init();
    },
    applyProps(instance: PixiBetterScroller, oldProps, _newProps) {
      const { ...newProps } = _newProps;
      applyDefaultProps(instance, oldProps, newProps);
      instance.update();
    },
  });
  const Renderer = () => {
    const [items, update] = React.useState<number[]>([0]);
    return (
      <Container {...config.size}>
        <YogaProvider>
          <Flex
            {...{
              ...config.size,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-evenly",
              margin: 0,
              centerAnchor: true,
            }}
          >
            <FlexBox width={200} height={200} centerAnchor>
              {(props, visible) => {
                // console.log(props);
                return (
                  <Box {...props}>
                    {(p) => {
                      return (
                        // <StyledButton text="开始" {...{ x: p.x, y: p.y }} textStyle={{}} />
                        <Container {...{ x: p.x, y: p.y }}>
                          <Button
                            interactive
                            // pointerover={() => {
                            //   console.log("pointerover");
                            //   update((items) => items.concat([0]));
                            // }}
                            pointerup={(e) => {
                              update((items) => items.concat([0]));
                            }}
                          />
                        </Container>
                      );
                    }}
                    {/* <App {...props} /> */}
                  </Box>
                );
              }}
            </FlexBox>
            {items.map((_, key) => {
              return (
                <FlexBox key={key} width={200} height={200} centerAnchor>
                  {(props, visible) => {
                    // console.log(props);
                    return (
                      // <AppProvider value={app}>
                      //   <Container {...config.size}>
                      //   <Box {...props}>
                      //   {/* <Sprite texture={PIXI.Texture.WHITE} tint={0xaddb67} {...props} /> */}
                      //   {/* <App /> */}
                      //   {(p) => <App {...p} />}
                      // </Box>
                      <Spring to={props} config={{ mass: 10, tension: 1000, friction: 100 }}>
                        {(p) => {
                          // console.log(props, visible, p);
                          return (
                            <Container {...{ x: p.x, y: p.y }}>
                              <ScrollerContainer {...{ width: 200, height: 200, x: 0, y: 0 }}>
                                <Container>
                                  <Sprite
                                    width={1280}
                                    height={720}
                                    texture={PIXI.Texture.WHITE}
                                    tint={0xaddb67}
                                  />
                                  <App />
                                </Container>
                              </ScrollerContainer>
                            </Container>
                          );
                        }}
                      </Spring>
                      //   </Container>
                      // </AppProvider>
                    );
                  }}
                </FlexBox>
              );
            })}
          </Flex>
        </YogaProvider>
      </Container>
    );
  };
  render(
    <AppProvider value={app}>
      {/* <Container {...config.size}>
        <Box x={0} y={100}>
          {(p) => <App {...p} />}
        </Box>
      </Container> */}
      {/* <Main2 /> */}
      <Renderer />
    </AppProvider>,
    parent
  );
  return () => unmountComponentAtNode(parent);
}

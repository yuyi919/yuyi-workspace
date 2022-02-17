import {
  Container,
  Sprite,
  ParticleContainer,
  Stage,
  useApp,
  _ReactPixi,
} from "@inlet/react-pixi/animated";
import { AnimatedDisplayObjectProps } from "@plugins/react-pixijs";
import { Flex, FlexBox, FlexBoxRenderProps, FlexProps } from "@plugins/react-pixijs/components";
import { animated, Spring, useSpring, to } from "@react-spring/web";
import { CSSProperties } from "@yuyi919/shared-types";
import { defaults } from "lodash";
import React from "react";

export const FlexContainer = React.forwardRef<
  PIXI.Container,
  React.PropsWithChildren<
    AnimatedDisplayObjectProps<PIXI.Container> & { background?: boolean; flex?: FlexProps }
  >
>(({ flex, children, x, y, scale, visible, background, ...props }, ref) => {
  const flexProps = React.useMemo(() => {
    const { width, height } = props;
    return defaults(flex, { width, height });
  }, [flex, props.width, props.height]);
  return (
    <FlexBox {...flexProps}>
      {({ ready, ...renderer }) => {
        ready && console.log(renderer, ref);
        const xy = {
          x: to(x ?? 0, (x) => x + renderer.x),
          y: to(y ?? 0, (x) => x + renderer.y),
        };
        return (
          <Container
            ref={ref}
            {...(ready
              ? {
                  ...renderer,
                  ...xy,
                  visible: visible ?? true,
                }
              : { visible: false })}
            scale={(scale as _ReactPixi.PointLike) || 1}
            {...props}
          >
            {background && (
              <Sprite
                texture={PIXI.Texture.WHITE}
                tint={0xaddb67}
                width={flexProps.width}
                height={flexProps.height}
                anchor={renderer.anchor}
              />
            )}
            {children}
          </Container>
        );
      }}
    </FlexBox>
  );
});
FlexContainer.displayName = "FlexContainer";

export const FlexParticleContainer = React.forwardRef<
  PIXI.ParticleContainer,
  React.PropsWithChildren<
    AnimatedDisplayObjectProps<PIXI.ParticleContainer> & { background?: boolean; flex?: FlexProps }
  >
>(({ flex, children, scale, visible, background, ...props }, ref) => {
  const flexProps = React.useMemo(() => {
    const { width, height } = props;
    return defaults(flex, { width, height });
  }, [flex, props.width, props.height]);
  return (
    <FlexBox {...flexProps}>
      {({ ready, width, height, ...renderer }) => {
        ready && console.log(renderer, ref);
        return (
          <ParticleContainer
            properties={{ position: true }}
            ref={ref}
            {...(ready ? { ...renderer, visible: visible ?? true } : { visible: false })}
            scale={(scale as _ReactPixi.PointLike) || 1}
            {...props}
          >
            {background && (
              <Sprite
                texture={PIXI.Texture.WHITE}
                tint={0xaddb67}
                width={flexProps.width}
                height={flexProps.height}
                anchor={renderer.anchor}
              />
            )}
            {children}
          </ParticleContainer>
        );
      }}
    </FlexBox>
  );
});
FlexParticleContainer.displayName = "FlexParticleContainer";

export const View = () => {
  const app = useApp();
  const [height, setHeight] = React.useState(116);
  React.useEffect(() => {
    const handle = () => {
      setHeight((x) => x - 10);
    };
    window.addEventListener("click", handle);
    return () => {
      window.removeEventListener("click", handle);
    };
  });
  // const springProps = useSpring({ from: {x:0}, to: { x: 100 } });
  console.log("stage", app.stage);
  globalThis.devApp = app;
  return (
    <Flex
      width={500}
      height={500}
      {...{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
      }}
    >
      <Spring
        to={{ scaleY: 1 }}
        from={{ scaleY: 0 }}
        config={{ tension: 1000, friction: 100, bounce: 0.5 }}
        delay={1000}
      >
        {(props) => (
          <FlexContainer
            width={500}
            height={200}
            flex={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-around",
            }}
            pivot={[0, 58]}
            scale={props.scaleY.to((y) => [1, y])}
            y={58}
          >
            <Container>
              <FlexContainer width={120} height={height} background>
                <Sprite image={"/public/dialog_frame.png"} />
              </FlexContainer>
              <FlexContainer width={254} height={102} background>
                <Spring
                  to={{ scale: 1, alpha: 1 }}
                  from={{ scale: 0, alpha: 0 }}
                  config={{ mass: 10, tension: 1000, friction: 100, bounce: 0.5 }}
                  delay={1100}
                >
                  {({ scale, ...props }) => (
                    <Sprite
                      image={"/public/dialog_back.png"}
                      anchor={0.5}
                      position={{ x: 127, y: 51 }}
                      scale={scale.to((scale) => [scale, 1])}
                      {...props}
                    />
                  )}
                </Spring>
              </FlexContainer>
              <FlexContainer width={120} height={116} background>
                <Sprite
                  image={"/public/dialog_frame.png"}
                  scale={{ x: -1, y: 1 }}
                  position={{ x: 120, y: 0 }}
                />
              </FlexContainer>
            </Container>
          </FlexContainer>
        )}
      </Spring>
    </Flex>
  );
};
export const App = () => {
  const width = 500;
  const height = 500;
  const [show, setShow] = React.useState(true);
  const [num, update] = React.useState(1);
  React.useEffect(() => {
    const handle = () => {
      update((x) => x + 1);
    };
    window.addEventListener("click", handle);
    return () => {
      window.removeEventListener("click", handle);
    };
  });
  return (
    <div>
      {/* <Chestnut /> */}
      {/* <ContextBridge
        Context={AppContext}
        render={(children) => (
          <Stage
            {...{ width, height }}
            options={{
              backgroundColor: 0xffffff,
            }}
          >
            {children}
          </Stage>
        )}
      >
        <View></View>
      </ContextBridge> */}
      <Stage
        {...{ width, height }}
        options={{
          backgroundColor: 0xffffff,
        }}
        raf
      >
        <View></View>
      </Stage>
      {/* <Box ready>
        <SNumber number={num} />
      </Box> */}
      {/* <button onClick={() => setShow(false)}></button>
      <Flex
        width={500}
        height={500}
        {...{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-evenly",
        }}
      >
        <FlexBox
          width={500}
          height={200}
          {...{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-evenly",
          }}
        >
          <Box background="red">
            <FlexBox width={120} height={116}>
              {(p) => <Box {...p} />}
            </FlexBox>
            <FlexBox width={254} height={102}>
              {(p) => <Box {...p} />}
            </FlexBox>
            {show && (
              <FlexBox width={120} height={116}>
                {(p) => <Box {...p} />}
              </FlexBox>
            )}
          </Box>
        </FlexBox>
      </Flex> */}
      {/* <div style={{ color: "red" }}>1424s3</div> */}
    </div>
  );
};

const Box: React.FC<Partial<FlexBoxRenderProps> & Omit<CSSProperties, keyof FlexBoxRenderProps>> = (
  props
) => {
  const { children, x, y, ready, ...style } = props;
  ready && console.log(props);
  return (
    ready && (
      <div
        style={{
          left: x,
          top: y,
          background: "white",
          position: "absolute",
          ...style,
        }}
      >
        {children}
      </div>
    )
  );
};

import { withFilters, Container, Sprite, Stage, useApp } from "@inlet/react-pixi/animated";
import { Flex, FlexBoxRenderProps } from "@plugins/react-pixijs/components";
import {
  Interpolation,
  FrameValue,
  animated,
  Spring,
  useSpring,
  useTransition,
  useSpringRef
} from "@react-spring/web";
import { CSSProperties } from "@yuyi919/shared-types";
import React from "react";
import ReactDOM from "react-dom";
import { FlexContainer, Dialog, InfoWindow, SetupMenu } from "./pixi";
import { MessageHub, AddFunction } from "./components";
import { TColorOverlayFilter, TDisplacementFilter } from "./pixi/filters";

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
        justifyContent: "space-evenly"
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
              justifyContent: "space-around"
            }}
            pivot={[0, 58]}
            scale={props.scaleY.to((y) => [1, y])}
            y={58}
          >
            <Container>
              <FlexContainer width={120} height={height} background>
                <Sprite texture={PIXI.Texture.WHITE} tint={0xaddb67} />
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
                      texture={PIXI.Texture.WHITE}
                      tint={0xaddb67}
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
                  texture={PIXI.Texture.WHITE}
                  tint={0xaddb67}
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

function TestHub() {
  const ref = React.useRef<null | AddFunction>(null);

  const handleClick = React.useCallback(() => {
    ref.current?.("test");
  }, []);
  const remote = React.useMemo<HTMLDivElement>(() => document.createElement("div"), []);
  React.useEffect(() => {
    document.body.appendChild(remote);
    return () => remote.remove();
  }, []);
  return (
    <div>
      <button onClick={handleClick}>test</button>
      {ReactDOM.createPortal(
        <MessageHub
          children={(add: AddFunction) => {
            ref.current = add;
          }}
        />,
        remote
      )}
    </div>
  );
}
const Filters = withFilters(Container, {
  blur: PIXI.filters.BlurFilter
  // noise: PIXI.filters.NoiseFilter
  // adjust: AdjustmentFilter
});

interface Manager<T> {
  data: T[];
  children: (data: T) => any;
  pre?: boolean;
}
function SceneManager<T>({ children, data, pre }: Manager<T>) {
  const [index, set] = React.useState(0);
  const onClick = React.useCallback(() => set((state) => (state + 1) % data.length), [data.length]);
  const transRef = useSpringRef();
  const transitions = useTransition(index, {
    ref: transRef,
    initial: { level: 0.5, alpha: 0.5, config: { duration: 1000 } },
    from: { level: 1, alpha: 0 },
    enter: { level: 0, alpha: 1 },
    leave: { level: 1, alpha: 0 },
    config: { duration: 3000 }
  });
  React.useEffect(() => {
    transRef.start();
  }, [index]);
  return (
    <Container interactive pointerup={onClick}>
      {transitions((props, i) => {
        return (
          <TColorOverlayFilter
            color={0xffffff}
            alpha={props.alpha.to({ range: [0, 0.5, 1], output: [1, 1, 0] })}
          >
            <Container alpha={props.alpha.to({ range: [0, 0.5, 1], output: [0, 1, 1] })}>
              <TDisplacementFilter
                x={props.level.to({ range: [0, 0.5, 1], output: [pre ? 1 : 0, 150, 150] })}
                blur={150}
              >
                {children(data[i])}
              </TDisplacementFilter>
            </Container>
          </TColorOverlayFilter>
        );
      })}
    </Container>
  );
}

export const App = () => {
  const width = 1280;
  const height = 720;
  const [show, setShow] = React.useState(true);
  const stage = React.useRef<any>();
  // const [num, update] = React.useState(1);
  // React.useEffect(() => {
  //   const handle = () => {
  //     update((x) => x + 1);
  //   };
  //   window.addEventListener("click", handle);
  //   return () => {
  //     window.removeEventListener("click", handle);
  //   };
  // });
  React.useEffect(() => {
    console.log(stage.current.app.view?.click());
  }, []);
  return (
    <div
      style={{
        flexDirection: "column",
        placeItems: "center",
        display: "flex"
      }}
    >
      <TestHub />
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
        ref={stage}
        {...{ width, height }}
        options={{
          autoStart: true,
          autoDensity: true,
          antialias: true
        }}
        raf={true}
      >
        <SceneManager data={[`/public/bg_1.jpg`, `/public/bg_2.jpg`, `/public/bg_3.jpg`]}>
          {(data) => (
            <Container>
              {/* <Sprite x={0} texture={PIXI.Texture.WHITE} width={1280} height={720} alpha={1} /> */}

              <Filters blur={{ blur: 4 }}>
                <Sprite image={data} />
              </Filters>
              <Sprite x={250} scale={1} image="/public/HELL_NAOKI_0201NO_0001.png" />
              {/* <Sprite x={250} scale={1} image="/public/HELL_MASA_0302Sk_0001.png" /> */}
              {/* <Sprite x={250} scale={0.5} image="/public/空.png" /> */}
            </Container>
          )}
        </SceneManager>

        {/* <Spring to={{ scaleY: 0 }} from={{ scaleY: 400 }} config={{ duration: 3000 }}>
          {(props) => {
            return (
              <TDisplacementFilter x={props.scaleY}>
                <Filters blur={{ blur: 4 }}>
                  <Sprite image="/public/bg_1.jpg" />
                </Filters>
              </TDisplacementFilter>
            );
          }}
        </Spring> */}
        {/* <Dialog x={640} y={360}></Dialog> */}
        <SetupMenu></SetupMenu>
        {/* <InfoWindow x={640} y={160} width={400} height={50}></InfoWindow> */}
        {/* <View></View> */}
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
          ...style
        }}
      >
        {children}
      </div>
    )
  );
};

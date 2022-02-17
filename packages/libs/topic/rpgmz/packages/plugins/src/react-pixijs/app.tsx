// import RotatingBunny from './RotatingBunny';
import * as PIXI from "pixi.js";
import React from "react";
import {
  Container,
  AnimatedSprite as ReactPixiAnimatedSprite,
  useApp,
  Sprite,
  _ReactPixi,
} from "@inlet/react-pixi/animated";
import { useUpdater } from "./hooks";

const spritesheet = "https://pixijs.io/examples/examples/assets/spritesheet/fighter.json";

const AnimatedSprite = React.memo<any>(({ isPlaying, ...props }) => {
  const animationSprite = React.useRef<PIXI.AnimatedSprite>(null);

  React.useEffect(() => {
    const sprite = animationSprite.current;
    sprite![isPlaying ? "gotoAndPlay" : "gotoAndStop"](sprite!.currentFrame);
  }, [isPlaying]);

  return <ReactPixiAnimatedSprite isPlaying ref={animationSprite} {...props} />;
});

export const App: React.FC<any> = (props) => {
  const ref = React.useRef<PIXI.Container>(null);
  const [frames, setFrames] = React.useState<any[]>([]);
  const [rot, setRot] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const app = useApp();
  async function load(spritesheet: string) {
    const laded = app.loader.resources[spritesheet];
    if (!laded) {
      return new Promise<PIXI.LoaderResource>((resolve) => {
        app.loader.add(spritesheet).load((_, resources) => {
          resolve(resources[spritesheet]);
        });
      });
    }
    return laded as PIXI.LoaderResource;
  }

  useUpdater((delta) => setRot((r) => r + 0.01 * delta));

  // load
  React.useEffect(() => {
    load(spritesheet).then((resource) => {
      console.log(resource);
      setFrames(Object.keys(resource.data.frames).map((frame) => PIXI.Texture.from(frame)));
    });
    console.log(ref);
  }, []);

  if (frames.length === 0) {
    return null;
  }
  return (
    <Container
      ref={ref}
      interactive={true}
      width={200}
      height={200}
      rotation={rot}
      mouseout={() => {
        console.log("mouseout", props);
        setIsPlaying(() => true);
      }}
      pointerout={() => {
        console.log("pointerout", props);
        setIsPlaying(() => true);
      }}
      pointerleave={() => {
        console.log("pointerleave", props);
        setIsPlaying(() => true);
      }}
      pointerupoutside={() => {
        console.log("pointerupoutside", props);
        setIsPlaying(() => true);
      }}
      pointercancel={() => {
        console.log("pointercancel", props);
        setIsPlaying(() => true);
      }}
      pointerover={() => {
        console.log("pointerover", props);
        setIsPlaying(() => false);
      }}
      {...props}
    >
      <Sprite width={200} anchor={0.5} height={200} texture={PIXI.Texture.WHITE} />
      <AnimatedSprite
        animationSpeed={0.5}
        isPlaying={isPlaying && globalThis.SceneManager.isGameActive()}
        textures={frames}
        anchor={0.5}
      />
    </Container>
  );
};

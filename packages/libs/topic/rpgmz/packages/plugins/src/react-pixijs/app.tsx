// import RotatingBunny from './RotatingBunny';
import * as PIXI from "pixi.js";
import React from "react";
import {
  Container,
  AnimatedSprite as ReactPixiAnimatedSprite,
  useApp,
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
    <Container ref={ref} {...props}>
      <AnimatedSprite
        rotation={rot}
        interactive={true}
        pointerout={() => {
          console.log("pointerout", props);
          setIsPlaying(() => true);
        }}
        pointerover={() => {
          console.log("pointerover", props);
          setIsPlaying(() => false);
        }}
        animationSpeed={0.5}
        isPlaying={isPlaying && globalThis.SceneManager.isGameActive()}
        textures={frames}
        anchor={0.5}
      />
    </Container>
  );
};

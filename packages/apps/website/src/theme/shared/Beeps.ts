import React from "react";
import { Howl, Howler } from "howler";
import { useBleeps, Bleeps, Bleep } from "@arwes/sounds";
import { SoundType } from "../ArwesTheme";
import clsx from "clsx";
import { Blockquote, Text, FrameLines } from "@arwes/core";
import { Animator } from "@arwes/animation";
import { BleepsProvider, useBleepsSetup } from "@arwes/sounds";
import { useInView } from "react-intersection-observer";
import empty from "./empty.ogg?url";

let audioUnlocked = false;
export const tryAutoPlay = (file: string = empty) =>
  new Promise<boolean>((resolve) => {
    let audio = document.createElement("audio");
    // require一个本地文件，会变成base64格式
    audio.src = file;
    // audio.loop = true;
    document.body.appendChild(audio);
    let autoplay = true;
    // play返回的是一个promise
    audio
      .play()
      .then(() => {
        // 支持自动播放
        autoplay = true;
        // @ts-ignore
        audioUnlocked = Howler._audioUnlocked = true;
        console.log("autoplay");
      })
      .catch((err) => {
        // @ts-ignore
        audioUnlocked = Howler._audioUnlocked = false;
        // 不支持自动播放
        autoplay = false;
      })
      .finally(() => {
        // 告诉调用者结果
        resolve(autoplay);
        audio.remove();
      });
  });

export function unlock(howl: Howl) {
  // @ts-ignore
  howl._onunlock.forEach(({ fn }) => fn());
}

/**
 * 使用自动播放音频
 * @param type
 * @param outType
 */
export function useMountBeep(
  type: SoundType | ((Bleeps: Bleeps) => Bleep | false | null | undefined),
  outType?: SoundType
) {
  const bleep = useBleeps();
  React.useEffect(() => {
    const sound = type instanceof Function ? type(bleep) : bleep[type];
    if (sound && !sound.getIsPlaying()) {
      // sound._howl.load().play()
      unlock(sound._howl);
      if (sound._howl.state() === "loading") {
        sound._howl.once("load", () => {
          console.log("loaded", sound);
          sound.play();
        });
      } else {
        console.log(sound._howl.state(), sound);
        sound.play();
      }
      // console.log("play", sound);
      return () => {
        if (sound.getIsPlaying()) {
          sound.stop();
        }
        if (outType) {
          const out = bleep[outType];
          if (!out.getIsPlaying()) {
            out.play();
          }
        }
      };
    }
  }, []);
}

export function useInViewBeep(type: SoundType) {
  const bleep = useBleeps();
  React.useEffect(() => {
    const sound = bleep[type];
    sound.play();
    return () => {
      if (sound.getIsPlaying()) {
        sound.stop();
      }
    };
  }, []);
}

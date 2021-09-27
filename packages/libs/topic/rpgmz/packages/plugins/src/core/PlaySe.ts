import { join } from "path";
import Core from "@yuyi919/rpgmz-core";

export function resolveVoicePath(...path: string[]) {
  return join("../voices", ...path).replace(/\\/gi, "/");
}

export function playVoice(voicePath: string, volume = 150, pitch = 100, pan = 0) {
  const name = resolveVoicePath(voicePath);
  return playStaticSe(name, volume, pitch, pan);
}

export function playApiVoice(name: string, url: string): void {
  const buffer = loadStaticVoice(name, url);
  if (buffer && buffer.name === name) {
    Core.AudioManager.updateSeParameters(buffer, {
      name: name,
      volume: 100,
      pitch: 100,
    });
    buffer.play(false);
  }
}

export function loadStaticVoice(name: string, url: string) {
  if (url) {
    const buffer = new Core.WebAudio(encodeURI(url), false);
    buffer.name = name;
    buffer.frameCount = Core.Graphics.frameCount;
    Core.AudioManager._staticBuffers.push(buffer);
    return buffer;
  }
}
const loadedMap = {};
export function playStaticSe(name: string, volume = 150, pitch = 100, pan = 0) {
  const { AudioManager } = Core;
  let curBuffer: Core.WebAudio | null = loadedMap[name];
  if (!curBuffer) {
    AudioManager.playStaticSe({ name, volume, pitch, pan });
    for (const buffer of Core.AudioManager._staticBuffers) {
      if (buffer.name === name) {
        loadedMap[name] = curBuffer = buffer;
      }
    }
  } else {
    // console.log("load se buffer", name);
    curBuffer.play(false);
  }
  return (
    curBuffer &&
    Object.assign(curBuffer!, {
      wait: new Promise<Core.WebAudio>((resolve) => {
        curBuffer!.addStopListener(() => {
          resolve(curBuffer!);
        });
      }),
    })
  );
}

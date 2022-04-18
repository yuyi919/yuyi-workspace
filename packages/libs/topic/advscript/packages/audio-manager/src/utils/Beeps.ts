import { Howler } from "howler";
import { HowlWrap } from "../HowlWrap";
import empty from "./empty.ogg?inline";
console.log(empty);
let audioUnlocked = false;
export const tryAutoPlay = (file: string = empty) =>
  audioUnlocked
    ? Promise.resolve(audioUnlocked)
    : new Promise<boolean>((resolve) => {
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

            // console.log("autoplay");
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
            audio = null;
          });
      });

export function unlock(howl: HowlWrap) {
  // @ts-ignore
  howl._onunlock.forEach(({ fn }) => fn());
}

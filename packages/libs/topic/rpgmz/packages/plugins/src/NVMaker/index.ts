/* eslint-disable no-control-regex */
import Core from "@yuyi919/rpgmz-core";
import { ExStandingPicture } from "./ExStandingPicture";

const { Env } = ExStandingPicture;
export default Yuyi919.createPlugin(function ({ registerCommand }) {
  // Core.SceneManager.showDevTools();
  // console.log('showDevTools');
  ExStandingPicture.init();
  // async function readDirs() {
  //   try {
  //     const list = await fs.readdir(resolvePath('img/pictures/tachie'));
  //     for (const dirname of list) {
  //       const dirpath = resolvePath('img/pictures/tachie', dirname);
  //       const info = await fs.stat(dirpath);
  //       if (info.isDirectory()) {
  //         const inner = await fs.readdir(dirpath);
  //         console.error(inner);
  //       }
  //     }
  //   } catch (error) {

  //   }
  // }
  // readDirs();
  for (const target of [Core.Scene_Map, Core.Scene_Battle]) {
    Yuyi919.proxyMethodAfter(target, "update", () => {
      ExStandingPicture.update();
    });
    Yuyi919.proxyMethodAfter(target, "createDisplayObjects", (target) => {
      ExStandingPicture.create(target);
    });
  }

  Yuyi919.proxyMethod(Core.Window_Message, "updateClose", (target, handle) => {
    // ピクチャ消去判定
    if (target._closing && target.openness == 255) {
      Env.GlobalTachieConfig.left.dispose();
      Env.GlobalTachieConfig.right.dispose();
    }
    handle();
  });

  Yuyi919.proxyMethod(Core.WebAudio, "_realUrl", (target, source) => {
    if (!/\.ogg$/.test(target._url)) return target._url;
    return source();
  });
  Yuyi919.proxyMethod(Core.WebAudio, "_readableBuffer", (target, source) => {
    if (!/\.ogg$/.test(target._url)) return target._data!.buffer;
    return source();
  });

  Yuyi919.proxyMethod(Core.Window_Message, "startMessage", function (_, handle, ...args) {
    ExStandingPicture.handleMessage();
    return handle(...args);
  });

  Yuyi919.proxyMethod(
    Core.Window_Base,
    "convertEscapeCharacters",
    function (_, sourceHandle, text) {
      // 立ち絵呼び出し用の制御文字を追加
      text = text.replace(/\\FL\[(\w+)\]/gi, "");
      text = text.replace(/\\FR\[(\w+)\]/gi, "");
      text = text.replace(/\\ML\[(\w+)\]/gi, "");
      text = text.replace(/\\MR\[(\w+)\]/gi, "");
      text = text.replace(/\\FF\[(\w+)\]/gi, "");
      return sourceHandle(text);
    }
  );

  registerCommand("callText", async (arg: { text?: string; textPath?: string }) => {
    arg.text &&
      console.log({
        text: eval(arg.text.replace(/\x1b/g, "\\\\")),
      });
    // playLoopBgm("001_bAttle party");
    // const event: Game_Event = $gameMap.event(This.eventId());
    // alert(1)
    // @ts-ignore
    // $gameMap.canvasToMapX(event.screenX()) === event.x
    // alert(event.screenX());
    Yuyi919.EventCommand.generateEvent()
      .playSe("../voices/Absorb2")
      .configureMessage("克里斯")
      .sendMessage("\\SE[../voices/Absorb2]测试\\!对话")
      // .stopSe()
      // .playSe("../voices/Absorb2")
      .configureMessage("琴叶葵")
      .sendMessage("\\FL[yukari1]\\ML[jumpjump]67890")
      .call();
  });

  // //@ts-ignore
  // globalThis.playVoice = playVoice;
  // //@ts-ignore
  // globalThis.playStaticSe = playStaticSe;
});

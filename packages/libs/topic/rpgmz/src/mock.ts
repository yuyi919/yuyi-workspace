import { SoundManager, Sprite_Clickable, Window_Command } from "@yuyi919/rpgmz-core";
import { createConstructor, proxyMethodAfter } from "@yuyi919/rpgmz-plugin-transformer";
import { mockLoadedEsModule } from "./lib";

// import * as Core from "@plugins/plugin.Core";
// import * as AdvCore from "@plugins/plugin.AdvCore";
// import * as NVMaker from "@plugins/plugin.NVMaker";
// import * as ReactPixi from "@plugins/plugin.react-pixijs";
// import * as ScreenZoom from "@plugins/plugin.ScreenZoom";
// import * as MsgExtra from "@plugins/plugin.MsgExtra";
// import * as BattleSeqExtra from "@plugins/plugin.BattleSeqExtra";

// mockLoadedEsModule("yuyi919_PluginManager.js", async () => {
//   return {
//     execute: () => Core,
//   };
// });
// mockLoadedEsModule("yuyi919_增强文本控制符.js", async () => {
//   // const MsgExtra = await import("@plugins/plugin.MsgExtra");
//   return {
//     execute: () => MsgExtra,
//   };
// });
// mockLoadedEsModule("yuyi919_VisuMZ战斗序列增强.js", async () => {
//   // const MsgExtra = await import("@plugins/plugin.BattleSeqExtra");
//   return {
//     execute: () => BattleSeqExtra,
//   };
// });
// mockLoadedEsModule("yuyi919_镜头缩放效果.js", async () => {
//   // const ScreenZoom = await import("@plugins/plugin.ScreenZoom");
//   return {
//     execute: () => ScreenZoom,
//   };
// });
// mockLoadedEsModule("yuyi919_视觉小说对白.js", async () => {
//   // const NVMaker = await import("@plugins/plugin.NVMaker");
//   return {
//     execute: () => NVMaker,
//   };
// });
mockLoadedEsModule("yuyi919_react-pixijs.js", async () => {
  const SuperWindowCommand = createConstructor(Window_Command as { new (): Window_Command });
  @SuperWindowCommand()
  class Extends extends Window_Command {
    makeCommandList(): void {}

    // eslint-disable-next-line @typescript-eslint/member-ordering
    lastIndex = -1;
    processCursorMove() {
      SuperWindowCommand.processCursorMove();
      if (this.isOpenAndActive() && this.isCursorMovable()) {
        const lastIndex = this.lastIndex,
          index = this.index();
        if (lastIndex > -1 && index !== lastIndex) {
          console.log("change selected", index);
          // AudioManager.playStaticSe({ name: "bsd/SystemSE_Select", volume: 100, pitch: 100 })
          globalThis.SoundManager.playCursor();
        }
        this.lastIndex = index;
      }
    }
  }
  // proxyMethodAfter(Window_Command as { new (): Window_Command }, "processCursorMove", (target) => {
  //   if (target.isOpenAndActive() && target.isCursorMovable()) {
  //     const lastIndex = target.__lastIndex,
  //       index = target.index();
  //     if (lastIndex > -1 && index !== lastIndex) {
  //       console.log("lastIndex");
  //       // AudioManager.playStaticSe({ name: "bsd/SystemSE_Select", volume: 100, pitch: 100 })
  //       globalThis.SoundManager.playCursor();
  //     }
  //     target.__lastIndex = index;
  //   }
  // });
  // proxyMethodAfter(Sprite_Clickable, "onMouseEnter", () => {
  //   SoundManager.playCursor()
  //   console.log("playCursor")
  // })
  // await import("./lib/start")
  return {
    execute: () => null
  };
  // const ReactPixi = await import("@plugins/plugin.react-pixijs");
  // return {
  //   execute: () => ReactPixi,
  // };
});
// mockLoadedEsModule("yuyi919_ADV核心.js", async () => {
//   // const AdvCore = await import("@plugins/plugin.AdvCore");
//   return {
//     execute: () => AdvCore,
//   };
// });

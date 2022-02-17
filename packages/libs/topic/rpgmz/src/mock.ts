import { mockLoadedEsModule } from "./System";
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
  const ReactPixi = await import("@plugins/plugin.react-pixijs");
  return {
    execute: () => ReactPixi,
  };
});
// mockLoadedEsModule("yuyi919_ADV核心.js", async () => {
//   // const AdvCore = await import("@plugins/plugin.AdvCore");
//   return {
//     execute: () => AdvCore,
//   };
// });

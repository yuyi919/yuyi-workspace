import Core from "@yuyi919/rpgmz-core";
export const enum BattlerType {
  行动者 = "user",
  当前目标 = "current target",
  全体目标 = "all targets",
}
// export enum PluginName {
//   /**
//    * yanfly战斗核心
//    */
//   VisuMZ战斗核心 = "VisuMZ_1_BattleCore",
// }
// enum VisuMZ战斗核心 {
//   "战斗序列_缩放镜头" = "ActSeq_Zoom_Scale",
// }
// export const PluginCommands = {
//   VisuMZ战斗核心,
// };
export interface CommonCallScriptCommand {
  VisuMZ_4_CombatLog: {
    CombatLogAddText: {
      Text: string;
      Icon: number;
    };
  };
  /**
   * VisuMZ战斗核心
   */
  VisuMZ_1_BattleCore: {
    /**
     * 战斗序列：缩放镜头
     */
    ActSeq_Zoom_Scale: {
      Scale: number;
      Duration: number;
      EasingType: "InOutSine";
      WaitForZoom: boolean;
    };
    /**
     * 战斗序列：聚焦镜头，需要配合缩放使用
     */
    ActSeq_Camera_FocusTarget: {
      Targets: BattlerType[];
      Duration: number;
      EasingType: "InOutSine";
      WaitForCamera: boolean;
    };
    /**
     * 战斗序列：偏移镜头
     */
    ActSeq_Camera_Offset: {
      OffsetX: number;
      OffsetY: number;
      Duration: number;
      EasingType: "InOutSine";
      WaitForCamera: boolean;
    };
    /**
     * 战斗序列：等待镜头运动结束
     */
    ActSeq_Camera_WaitForCamera: {};

    /**
     * 战斗序列：打印log
     */
    ActSeq_BattleLog_AddText: {
      Text: string;
    };
  };
}

export function callScriptCommand<K extends keyof CommonCallScriptCommand>(key: K) {
  Core.$gameTroop._interpreter.command357([key]);
}

export function callScriptCommandWith<
  ScriptName extends keyof CommonCallScriptCommand,
  CommandName extends keyof CommonCallScriptCommand[ScriptName]
>(
  scriptName: ScriptName,
  commandName: CommandName,
  parameters: CommonCallScriptCommand[ScriptName][CommandName] | null
) {
  // eslint-disable-next-line no-sparse-arrays
  Core.$gameTroop._interpreter.command357([scriptName, commandName, , parameters]);
}

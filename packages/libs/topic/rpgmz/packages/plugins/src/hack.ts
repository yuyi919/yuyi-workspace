import { Spriteset_Base } from "@yuyi919/rpgmz-core";

declare module "@yuyi919/rpgmz-core" {
  export namespace BattleManager {
    const _target: any;
    const _autoBattle: boolean;
  }
  export interface Sprite {
    _baseY: number;
    _baseX: number;
    /**
     * @private
     */
    closing?: boolean;
    showing?: boolean;
    opening?: boolean;
    originX?: number;
    originY?: number;
  }

  export interface Game_Battler {
    _stbExploited?: boolean | undefined;
    stbExploitedStates(): number[];

    name(): string;
  }
  export interface Game_Temp {
    /**
     * 强制指定战斗为侧视/前视模式
     */
    _forcedTroopView?: "SV" | "FV";
  }
  export namespace SceneManager {
    function isSceneBattle(): boolean;
  }
  export interface Scene_Base {
    _spriteset?: Spriteset_Base;
  }
  export interface DataSkill {
    meta: any;
  }
}

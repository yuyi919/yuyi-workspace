import { Spriteset_Base } from "@yuyi919/rpgmz-core";

//@ts-ignore
export declare module "@yuyi919/rpgmz-core" {
  export class BattleManager {
    static _target: any;
    static _autoBattle: boolean;
  }
  export class Sprite {
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

  export class Game_Battler {
    _stbExploited?: boolean | undefined;
    stbExploitedStates(): number[];

    name(): string;
  }
  export class Game_Temp {
    /**
     * 强制指定战斗为侧视/前视模式
     */
    _forcedTroopView?: "SV" | "FV";
  }
  export class SceneManager {
    static isSceneBattle(): boolean;
  }
  export class Scene_Base {
    _spriteset?: Spriteset_Base;
  }
  export interface DataSkill {
    meta: any;
  }
}

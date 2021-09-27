/* eslint-disable no-empty-pattern */
import RMMZ from "@yuyi919/rpgmz-core";
export function getCurrentTargetInBattle() {
  const { BattleManager } = RMMZ;
  return BattleManager._target;
}

/**
 * 判断对象是否在被利用状态(yanfly的stb战斗)
 * @param target
 */
function isStbExploited(target: RMMZ.Game_Battler) {
  return (
    target._stbExploited ||
    target._states.some((state) => target.stbExploitedStates().includes(state))
  );
}
export function getCurrentActorSpritesInBattle() {
  const { BattleManager, Game_Actor } = RMMZ;
  const subject = BattleManager._action.subject();
  if (subject instanceof Game_Actor) {
    return BattleManager._spriteset._actorSprites.find((i) => i._actor == subject);
  }
}
export function getCurrentEnemySpritesInBattle() {
  const { BattleManager } = RMMZ;
  const subject = BattleManager._action.subject();
  return BattleManager._spriteset._enemySprites.find((e) => e._enemy === subject);
}
export function getCurrentActorInBattle() {
  const finded = getCurrentActorSpritesInBattle();
  return finded && finded._actor;
}

export function isFV() {
  return RMMZ.$gameTemp._forcedTroopView === "FV";
}
function getUserOffset(zoom = 1, offsetToJump?: boolean) {
  let finded: RMMZ.Sprite_Actor | RMMZ.Sprite_Enemy = getCurrentActorSpritesInBattle()!;

  if (finded && isFV()) return 0;
  const center = 360;
  if (!finded) {
    finded = getCurrentEnemySpritesInBattle()!;
    console.log("敌人user", finded?._enemy?.name(), finded.y, finded._baseY);
  } else {
    console.log("角色user", finded?._actor?.name(), offsetToJump, finded.y, finded._baseY);
  }
  return (
    ((offsetToJump ? finded.y : finded._baseY) - center - (finded.height / 3) * 2) *
    Math.max(zoom, 0.5)
  );
}
function getCenter(ylist: number[]) {
  const 距离 = ylist.map((i) => Math.abs(360 - i));
  return ylist[距离.indexOf(Math.min(...距离))];
}

function getTargetOffset(zoom = 1) {
  const { BattleManager, Game_Actor } = RMMZ;
  let center = 360,
    finded: RMMZ.Sprite_Actor | RMMZ.Sprite_Enemy;
  const target = BattleManager._target;
  if (target instanceof Game_Actor) {
    if (isFV()) return 0;
    center -= 30;
    finded = BattleManager._spriteset._actorSprites.find(
      (actor) => actor._actor && actor._actor === BattleManager._target
    )!;
    console.log("角色target", target.name());
  } else {
    finded = BattleManager._spriteset._enemySprites.find(
      (actor) => actor._enemy === BattleManager._target
    )!;
    console.log("敌人target", target.name());
  }
  return finded ? (finded._baseY - center - (finded.height / 3) * 2) * Math.max(zoom, 0.5) : 0;
}

function getAllTargetOffset(zoom = 1) {
  const { BattleManager, Game_Actor } = RMMZ;
  let center = 360,
    finded: (RMMZ.Sprite_Actor | RMMZ.Sprite_Enemy)[];
  const target = BattleManager._target;
  if (target instanceof Game_Actor) {
    center -= 30;
    finded = BattleManager._spriteset._actorSprites.filter(
      (actor) => actor._actor && actor._actor === BattleManager._target
    )!;
    console.log("角色target", target.name());
  } else {
    finded = BattleManager._spriteset._enemySprites.filter((enemy) =>
      BattleManager._targets.includes(enemy._enemy)
    )!;
    console.log("敌人target", target.name());
  }
  const findedCenter = getCenter(finded.map((i) => i._baseY - i.height / 2));
  console.log("findedCenter", findedCenter);
  return finded ? (findedCenter - center) * Math.max(zoom, 0.5) : 0;
}
export function getCurrentEnemyInBattle() {
  const finded = getCurrentEnemySpritesInBattle();
  return finded && finded._enemy;
}
export default Yuyi919.createPlugin(
  ({ global: { PluginManager, BattleManager }, registerCommand }) => {
    registerCommand("playBattleVoice", (arg, handle, { $gameSwitches, Game_Actor }) => {
      if (BattleManager._battleTest) {
        const parameters = PluginManager.parameters("BattleVoiceMZ");
        const playSwitchId = Number(parameters["ON switch ID"]);
        if (playSwitchId) {
          $gameSwitches.setValue(playSwitchId, true);
        }
      }
      if (BattleManager._action.subject() instanceof Game_Actor) {
        const finded = getCurrentActorSpritesInBattle();
        if (finded) {
          console.log("播放战斗语音", finded?._actor?.name());
          finded._actor.performAction(BattleManager._action);
        }
      }
    });

    registerCommand("CameraFocusZoomAllTarget", ({ duration = 30, scale = 5, waitForCamera }) => {
      CameraFocusZoom({
        scale,
        duration,
        target: [Yuyi919.EventCommand.BattlerType.全体目标],
        waitForCamera,
      });
    });

    registerCommand(
      "CameraFocusZoomUser",
      ({ duration = 30, scale = 5, waitForCamera, offsetToJump = false }) => {
        CameraFocusZoom({
          scale,
          duration,
          target: [Yuyi919.EventCommand.BattlerType.行动者],
          waitForCamera,
          offsetToJump,
        });
      }
    );

    registerCommand("CameraFocusZoomTarget", ({ duration = 20, scale = 3, waitForCamera }) => {
      CameraFocusZoom({
        scale,
        duration,
        target: [Yuyi919.EventCommand.BattlerType.当前目标],
        waitForCamera,
      });
    });

    Yuyi919.registerFunc("isWaitCamera", ({ BattleManager, Game_Actor, Game_Enemy }) => {
      const isWaitCamera =
        !BattleManager._autoBattle &&
        (BattleManager._targets.some(
          (target) => BattleManager._target instanceof Game_Enemy && isStbExploited(target)
        ) ||
          BattleManager._actionBattlers.length === 0 ||
          BattleManager._actionBattlers[0] instanceof Game_Actor ||
          BattleManager._actionBattlers.some(isStbExploited));
      console.log("isWaitCamera", isWaitCamera);
      return isWaitCamera;
    });
    Yuyi919.registerFunc("isTargetExploited", ({ BattleManager }) => {
      return (
        BattleManager._target._stbExploited ||
        BattleManager._target._states.some((state) =>
          BattleManager._target.stbExploitedStates().includes(state)
        )
      );
    });

    /**
     * 清理动作序列的设定
     */
    Yuyi919.registerFunc("clearActionSequence", ({ Game_Action, $dataSkills }) => {
      $dataSkills.forEach((k) => {
        if (k) {
          // 清理公共事件
          k.effects = k.effects.filter((i) => i.code !== Game_Action.EFFECT_COMMON_EVENT);
          // 清理标签Custom Action Sequence以及带来的副作用
          k.note = k.note.replace("Custom Action Sequence", "");
          delete k.meta["Custom Action Sequence"];
        }
      });
    });
    
    const updateBackgroundOpacity = Yuyi919.registerFunc(
      "updateBackgroundOpacity",
      ({ BattleManager, Graphics, SceneManager }, opacity: number = 0, duration: number = 30) => {
        if (!SceneManager.isSceneBattle()) return;
        console.log(`opacity: number = ${opacity}, duration: number = ${duration}`);
        const start = BattleManager._spriteset._back1Sprite.opacity;
        const { process } = Yuyi919.Easing.createEasingHelper("linear", start, opacity, duration);
        let i = 0;
        return new Promise<void>((resolve) => {
          function update(deltaTime: number) {
            const {
              _spriteset: { _back1Sprite, _back2Sprite },
            } = BattleManager;
            // const next = SceneManager.determineRepeatNumber(deltaTime)
            i += SceneManager.determineRepeatNumber(deltaTime);
            _back1Sprite.opacity = _back2Sprite.opacity = process(i);
            // console.log(next, i, r)
            if (i === duration) {
              console.log("finish");
              Graphics._app.ticker.remove(update, Graphics);
              resolve();
            }
          }
          Graphics._app.ticker.add(update, Graphics);
        });
      }
    );
    const hideBackground = Yuyi919.registerFunc("hideBackground", ({}, duration: number) =>
      updateBackgroundOpacity(0, duration)
    );
    const showBackground = Yuyi919.registerFunc("showBackground", ({}, duration: number) =>
      updateBackgroundOpacity(255, duration)
    );
    registerCommand("setBackgroundOpacity", ({ duration, opacity }) =>
      updateBackgroundOpacity(opacity, duration)
    );
    registerCommand("hideBackground", ({ duration }) => hideBackground(duration));
    registerCommand("showBackground", ({ duration }) => showBackground(duration));
  }
);

function getCameraOffset(
  [target]: Yuyi919.EventCommand.BattlerType[],
  scale = 1,
  isFrontView?: boolean,
  offsetToJump?: boolean
) {
  if (target === Yuyi919.EventCommand.BattlerType.当前目标) {
    return getTargetOffset(scale - 1);
  }
  if (target === Yuyi919.EventCommand.BattlerType.行动者) {
    return getUserOffset(scale - 1, offsetToJump);
  }
  if (target === Yuyi919.EventCommand.BattlerType.全体目标) {
    return getAllTargetOffset(scale - 1);
  }
  return 0;
}
function CameraFocusZoom({
  scale,
  duration,
  target,
  waitForCamera,
  offsetToJump,
}: {
  target: Yuyi919.EventCommand.BattlerType | Yuyi919.EventCommand.BattlerType[];
  scale: number;
  duration: number;
  waitForCamera?: boolean;
  offsetToJump?: boolean;
}) {
  const isFrontView = isFV();
  const Targets = target instanceof Array ? target : [target];
  Yuyi919.EventCommand.callScriptCommandWith("VisuMZ_1_BattleCore", "ActSeq_Zoom_Scale", {
    Scale: scale,
    Duration: duration,
    EasingType: "InOutSine",
    WaitForZoom: false,
  });
  Yuyi919.EventCommand.callScriptCommandWith("VisuMZ_1_BattleCore", "ActSeq_Camera_FocusTarget", {
    Targets,
    Duration: duration,
    EasingType: "InOutSine",
    WaitForCamera: false,
  });
  const OffsetY = getCameraOffset(Targets, scale, isFrontView, offsetToJump); //getTargetOffset(scale - 1);
  if (OffsetY) {
    Yuyi919.EventCommand.callScriptCommandWith("VisuMZ_1_BattleCore", "ActSeq_Camera_Offset", {
      OffsetX: 0,
      OffsetY,
      Duration: duration,
      EasingType: "InOutSine",
      WaitForCamera: false,
    });
  }
  if (waitForCamera === true) {
    Yuyi919.EventCommand.callScriptCommandWith(
      "VisuMZ_1_BattleCore",
      "ActSeq_Camera_WaitForCamera",
      null
    );
  }
}

declare module "../core" {
  export namespace Yuyi919 {
    function isTargetExploited(): boolean;
    function updateBackgroundOpacity(opacity?: number, duration?: number): void;
    function hideBackground(duration?: number): void;
    function showBackground(duration?: number): void;
  }
}

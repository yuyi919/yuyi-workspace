import Core from "@yuyi919/rpgmz-core";

export function randomInt(max: number) {
  return Math.floor(max * Math.random()) + 1;
}
const getColor = (color: number) =>
  function (text: number | string, close = true) {
    return `\\C[${color}]${text}${close ? "\\C[0]" : ""}`;
  };
export const colors = {
  red: getColor(2),
  green: getColor(3),
  blue: getColor(4),
  purple: getColor(5),
  yellow: getColor(6),
};
export function getSpeaker(actor: Core.DataActor) {
  const { SceneManager, BattleManager, Game_Actor } = Core;
  if (!actor && SceneManager.isSceneBattle()) {
    const subject = BattleManager._action.subject();
    if (subject instanceof Game_Actor) {
      const actor = subject;
      if (actor) {
        const speakerName = actor.nickname() || actor.name();
        const speakerConfig =
          {
            faceName: actor.faceName(),
            faceIndex: actor.faceIndex(),
          } || undefined;
        return { speakerName, dicerName: speakerName, speakerConfig };
      }
    } else {
      const enemy = subject;
      if (enemy) {
        return {
          speakerName: enemy.name(),
          speakerConfig: {},
        };
      }
    }
  }
  const speakerName = actor && (actor.nickname || actor.name);
  const speakerConfig =
    (speakerName && {
      faceName: actor.faceName,
      faceIndex: actor.faceIndex,
    }) ||
    undefined;
  return { speakerName, dicerName: speakerName, speakerConfig };
}

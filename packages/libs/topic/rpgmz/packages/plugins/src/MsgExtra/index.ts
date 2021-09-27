/* eslint-disable no-fallthrough */
/* eslint-disable no-case-declarations */
import Core, { TextState, Window_Message, Scene_Battle } from "@yuyi919/rpgmz-core";
import { createConstructor } from "@yuyi919/rpgmz-plugin-transformer";
import { init } from "../core/Yuyi919";
import { randomInt, getSpeaker, colors } from "./utils";

const { registerCommand, getParameters } = init(globalThis);
//
// process parameters
//
export const parameters = getParameters();

registerCommand(
  "callDice",
  (args: { actorId: number; text: string; target: number; callMessage?: boolean }) => {
    const { $gameVariables, $dataActors, BattleManager } = Core;
    const autoProcess = BattleManager._autoBattle;
    const dice = [randomInt(6), randomInt(6), randomInt(6)];
    const total = dice.reduce((r, i) => r + i, 0);
    const result = total <= args.target ? 1 : 2;
    $gameVariables.setValue(parameters["diceResultVariableId"], result);
    const { speakerName, speakerConfig } =
      typeof args.actorId === "string"
        ? {
            speakerName: BattleManager._target.name(),
            speakerConfig: {},
          }
        : getSpeaker($dataActors[args.actorId]);

    const dices = `(${dice.map((i) => colors.purple(i)).join(" + ")}) = ${colors.purple(total)}`;
    const Text = `${speakerName ? speakerName + "的" : ""}${
      args.text ? colors.blue(args.text + "检定") : "投骰"
    }:  ${dices}${
      typeof args.target === "number"
        ? ` => ${total <= args.target ? colors.green("成功") : colors.red("失败")}`
        : ""
    }`;
    Yuyi919.EventCommand.callScriptCommandWith("VisuMZ_4_CombatLog", "CombatLogAddText", {
      Text,
      Icon: 87,
    });
    if (args.callMessage) {
      const event = Yuyi919.EventCommand.generateEvent();
      const message = `\\SE[骰子.wav]${speakerName ? speakerName + "的" : ""}${
        args.text ? args.text + "检定" : "投骰"
      }:\\W[SE]\\W[30]\\>   (${dice.join(" + ")}) = ${total}${
        typeof args.target === "number"
          ? ` => ${total <= args.target ? "\\SE[Decision3]成功" : "\\SE[Buzzer1]失败"}`
          : "\\SE[Decision3]"
      }${autoProcess ? "\\W[40]\\^" : "\\W[5] "}`;
      console.log("sendMessage", message);
      event.configureMessage(speakerName, speakerConfig).sendMessage(message);
      event.call();
    } else {
      Yuyi919.EventCommand.callScriptCommandWith(
        "VisuMZ_1_BattleCore",
        "ActSeq_BattleLog_AddText",
        {
          Text,
        }
      );
    }
  }
);
const defaultMode = Number(parameters["default SE"] || 1);
const battleDefaultMode = Number(parameters["battle default SE"] || 0);
const interval = parameters["interval"] || 2;
const name1 = parameters["name1"] || "Cursor1";
const volume1 = Number(parameters["volume1"] || 90);
const pitch1 = Number(parameters["pitch1"] || 100);
const name2 = parameters["name2"] || "Cursor2";
const volume2 = Number(parameters["volume2"] || 75);
const pitch2 = Number(parameters["pitch2"] || 125);

const configSes = [
  { name: name1, volume: volume1, pitch: pitch1 },
  { name: name2, volume: volume2, pitch: pitch2 },
];

const SuperSceneBattle = createConstructor(Scene_Battle);
@SuperSceneBattle(() => ExtendSceneBattle)
export class ExtendSceneBattle extends Scene_Battle {
  _messageWindow: ExtendWindowMessage;
  /**
   * set Battle Mode
   */
  createMessageWindow() {
    SuperSceneBattle.createMessageWindow();
    this._messageWindow.initializeBattlePlayingSe();
  }
}

type AudioCache = ReturnType<typeof Yuyi919.Audio.playStaticSe> & { playingId?: number };
const SuperWindowMessage = createConstructor(Core.Window_Message);
@SuperWindowMessage(() => ExtendWindowMessage)
export class ExtendWindowMessage extends Window_Message {
  charSESet: Map<string, AudioCache>;
  charSESetId: Map<string, number>;
  defaultSE: string;
  charSECount: number;
  enableDefault: boolean;

  initialize(rect?: Core.Rectangle): void {
    this.charSESet = new Map();
    this.charSESetId = new Map();
    SuperWindowMessage.initialize(rect);
  }

  initializePlayingSe() {
    this.charSECount = 0;
    this.defaultSE = defaultMode + "";
  }
  initializeBattlePlayingSe() {
    this.charSECount = 0;
    this.defaultSE = battleDefaultMode + "";
  }

  /**
   * initialize variables
   */
  initMembers() {
    SuperWindowMessage.initMembers();
    this.initializePlayingSe();
  }

  _obtainEscapeParam(textState: TextState, regExp = /^\[.+?\]/) {
    const arr = regExp.exec(textState.text.slice(textState.index));
    if (arr) {
      textState.index += arr[0].length;
      return arr[0].slice(1, arr[0].length - 1);
    } else {
      return false;
    }
  }
  /**
   * set the char SE mode
   * @param code
   * @param textState
   */
  processEscapeCharacter(code: string, textState: TextState) {
    switch (code) {
      case "SE":
        const seKey = this._obtainEscapeParam(textState);
        if (seKey) {
          this.enableDefault = false;
          if (!/^[0-9]+$/.test(seKey)) {
            const nextId = (this.charSESetId.get(seKey) || 0) + 1;
            // let playingSe = this.charSESet.get(seKey)
            console.log(`play ${seKey} ${nextId}`);
            // not supported yet
            const playingSe = Yuyi919.Audio.playStaticSe(seKey) as AudioCache;
            if (playingSe) {
              playingSe.playingId = nextId;
              this.charSESet.set(seKey, playingSe);
              playingSe.wait.then(() => {
                if (nextId === playingSe.playingId) {
                  // console.log(`delete ${seKey} ${nextId}`);
                  this.charSESet.delete(seKey);
                }
              });
              Array.from(this.charSESet.keys()).forEach(
                (key) =>
                  /^[0-9]+$/.test(key) && (this.charSESet.delete(key), console.log("clean", key))
              );
            }
            this.charSESetId.set(seKey, nextId);
          } else {
            this.charSESet.set(seKey, void 0);
            Array.from(this.charSESet.keys()).forEach(
              (key) =>
                !/^[0-9]+$/.test(key) && (this.charSESet.delete(key), console.log("clean", key))
            );
          }
        }
        break;
      case "W":
        const specmode = this._obtainEscapeParam(textState, /^\[[0-9]+?\]/);
        if (specmode) {
          this.startWait(parseInt(specmode));
        } else if (this._obtainEscapeParam(textState, /^\[SE\]/)) {
          const charSESets = Array.from(this.charSESet.entries()).filter(
            ([, playingSe]) => !!playingSe
          );
          if (charSESets.length > 0) {
            this.startWait(600000);
            Promise.all(
              charSESets.map(async ([seKey, playingSe]) => {
                // const id = this.charSESetId.get(seKey);
                // console.log(`wait ${seKey} ${id}`);
                await playingSe.wait;
                return [seKey, playingSe] as const;
              })
            ).then((charSESets) => {
              for (const [seKey, playingSe] of charSESets) {
                const id = this.charSESetId.get(seKey);
                if (playingSe.playingId === id) {
                  if (this._waitCount > 0) this._waitCount = 0;
                }
              }
            });
          }
        }
        break;
      case ">":
        // force to play char SE once.
        this.charSECount = interval + 1;
      // do not break, also do default process.
      default:
        SuperWindowMessage.processEscapeCharacter(code, textState);
        break;
    }
  }
  //
  // play char SE at message window
  //
  shouldBreakHere(textState: TextState) {
    const doesBreak = SuperWindowMessage.shouldBreakHere(textState);
    // 如果播放到末尾，在也一个函数中处理以严格控制顺序
    if (textState.text.length === textState.index) {
      // console.log("reset");
      this.enableDefault = true;
    } else {
      // console.log("process", doesBreak, textState.text[textState.index]);
      if (doesBreak) {
        this.processCharSE();
      } else {
        this.processCharVoice();
      }
    }
    return doesBreak;
  }

  processCharSE() {
    if (this._showFast) {
      // triggered (= skipping message)
      return;
    }
    if (!this._lineShowFast) {
      // unless '\>' mode
      ++this.charSECount;
    }
    if (this.charSECount > interval) {
      this.playCharSE();
      this.charSECount = 0;
    }
  }

  processCharVoice() {
    if (this._showFast) {
      return;
    }
    ++this.charSECount;
    if (this.charSECount > interval) {
      this.playCharSE();
      this.charSECount = 0;
    }
  }

  playCharSE(seKey?: string) {
    if (!seKey && !this.enableDefault) {
      return Array.from(this.charSESet.keys()).forEach((id) => this.playCharSE(id));
    }
    // eslint-disable-next-line prefer-const
    seKey = seKey || this.defaultSE;
    const { name, pitch, volume } = configSes[parseInt(seKey) - 1] || {};
    if (name) {
      const playingSe = Yuyi919.Audio.playStaticSe(name, pitch, volume);
      // console.log("playing", name1);
      if (playingSe && !this.enableDefault) {
        this.charSESet.set(seKey, playingSe);
      }
    }
  }
}

declare module "@yuyi919/rpgmz-core" {
  //@ts-ignore
  export class Window_Message extends ExtendWindowMessage {}
}

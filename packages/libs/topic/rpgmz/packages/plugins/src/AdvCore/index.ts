import RMMZ, {
  Graphics,
  ImageManager,
  Rectangle,
  Scene_Battle,
  Scene_Map,
  Scene_Message,
  Sprite,
  TextState,
  Window_Message,
  Window_NameBox,
} from "@yuyi919/rpgmz-core";
import { createConstructor, logger, x } from "@yuyi919/rpgmz-plugin-transformer";
import { computed, action, configure, observable } from "mobx";
import { DiceCaller, DiceConfig, TextboxConfig, TextSeConfig } from "./structs";
import { colors, getSpeaker, randomInt } from "./utils";
configure({
  enforceActions: "observed",
});

/**
 * Adv核心
 * @help
 * - 自定义信息框
 *   - 可以让你自定义对话框、姓名框的背景以及位置
 *     建议对话框、姓名框大小和背景图片保持一致。
 * - 让对话可以根据字的间隔自动播放SE(=Sound Effect)
 *   - 可以设置多种配置，并默认在战斗/非战斗场景中启用一项（索引）
 *     当索引不存在（如-1）则表示不播放se
 * - 控制字符
 *
 *  - \SE[<配置索引>]
 *     变更当前对话启用的SE配置项索引（不影响其他对话）
 *  - \>
 *     配置的SE在当前对话中只播放一次
 *  - \SE[<音频路径:text>]
 *     播放一次与配置无关的指定文件名称的SE（或其他(相对)路径正确的音频），
 *
 *  - \W[<帧数:number>]
 *     等待指定帧数再继续展示文本
 *  - \W[SE]
 *     等待上述所有SE播放完毕再继续展示文本
 *
 * @url http://rpg.blue/
 * @author yuyi919
 *
 */
@x.Plugin({ reactive: true })
export class PluginAdvCore {
  /**
   * 对话框配置集合，用数组索引作id
   */
  @observable.deep
  @x.Param()
  @x.Type(() => TextboxConfig)
  @x.Text("对话框配置集合")
  textboxConfigList: Array<TextboxConfig>;

  /**
   * 根据索引决定启用哪一个对话框配置
   * 如果为不存在的索引(如-1)则表示不启用任何配置
   * @min -1
   */
  @observable.ref
  @x.Param()
  @x.Text("对话框配置索引")
  textboxConfigId: number = 0;

  /**
   * 如果传入的索引不存在（如：-1），表示禁用，反之则启用对应的配置
   * @param id 对话框配置项索引
   */
  @x.Command()
  @x.Text("配置对话框配置索引")
  @action
  setTextboxConfigId(@x.Arg("id") id: number) {
    this.textboxConfigId = id;
  }

  @computed
  get currentTextboxConfig() {
    return this.textboxConfigList[this.textboxConfigId];
  }

  get enabled() {
    return !!this.currentTextboxConfig;
  }

  /**
   * 骰子配置
   */
  @observable
  @x.Param()
  @x.Type(() => DiceConfig)
  @x.Text("骰子配置")
  diceConfig: DiceConfig;

  /**
   * 文本展示时播放se
   */
  @observable
  @x.Param()
  @x.Type(() => TextSeConfig)
  @x.Text("文本播放se配置")
  seConfig: TextSeConfig = {
    defaultSE: 0,
    battleDefaultSE: 0,
    interval: 2,
    configRecord: [
      {
        name: "Cursor1",
        volume: 90,
        pitch: 100,
      },
      {
        name: "Cursor2",
        volume: 75,
        pitch: 125,
      },
    ],
  };

  /**
   * 测试
   * @param actorId 角色Id
   * @param target 目标值
   */
  @x.Command()
  @x.Text("幸运检定")
  callLuckyDice(@x.Arg("actorId", "actor") actorId: number, @x.Arg("target") target: number = 10) {
    return this.callDice({ actorId, target, callMessage: true });
  }

  /**
   * 丢个骰子
   */
  @x.Command()
  @x.Text("丢个骰子")
  callDice(
    @x.ArgDto(() => DiceCaller) args: DiceCaller
    // @x.Interpreter() interpreter?: RMMZ.Game_Interpreter
  ) {
    // console.log(interpreter);
    const { $gameVariables, $dataActors, BattleManager } = RMMZ;
    const autoProcess = BattleManager._autoBattle;
    const dice = [randomInt(6), randomInt(6), randomInt(6)];
    const total = dice.reduce((r, i) => r + i, 0);
    const result = total <= args.target ? 1 : 2;
    $gameVariables.setValue(this.diceConfig.diceResultVariableId, result);
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
}

// 信息框背景
const config = x.getHandler(PluginAdvCore);
logger.log("load", config);

class MessageBgSprite extends Sprite {
  _messageWindow: RMMZ.Window_Message;
  maxopac: number;
  imageID: number;
  z: number;
  constructor(bitmap?: RMMZ.Bitmap) {
    super(bitmap);
    this.initialize(bitmap);
  }
  initialize(bitmap?: RMMZ.Bitmap) {
    super.initialize(bitmap);
    this.opacity = 0;
    this.loadBitmap();
    this.update();
  }
  loadBitmap() {
    if (config.currentTextboxConfig) {
      this.imageID = config.textboxConfigId;
      this.bitmap = ImageManager.loadSystem(config.currentTextboxConfig.对话框图像名称);
      this.x = 0;
      this.maxopac = 255;
      this.bitmap.addLoadListener(() => {
        this.scale.x = this.bitmap.width / config.currentTextboxConfig.对话框宽度;
        this.scale.y = this.bitmap.height / config.currentTextboxConfig.对话框高度;
      });
      this.z = 10;
    }
    // this.opacity = 0;
  }
  setWindow(messageWindow: Window_Message) {
    this._messageWindow = messageWindow;
  }
  update() {
    super.update();
    if (this._messageWindow) {
      this.controlBitmap();
      this.repositionSprite();
    }
  }
  controlBitmap() {
    if (this.imageID !== config.textboxConfigId && !this._messageWindow.isClosing())
      this.loadBitmap(); // If image changed, reload bitmap
    if (!config.enabled || this._messageWindow.openness <= 0) {
      this.opacity = 0;
      this.maxopac = 255;
      return;
    }
    // Control image opacity
    switch (RMMZ.$gameMessage.background()) {
      case 0:
        // Window
        this.opacity = Math.min(this._messageWindow._openness, this.maxopac);
        break;
      case 1:
        // Dim
        this.opacity = this._messageWindow._openness * 0.5;
        this.maxopac = this.opacity;
        break;
      case 2:
        // Transparent
        this.opacity = 0;
        this.maxopac = 0;
        break;
    }
  }

  repositionSprite() {
    if (config.currentTextboxConfig) {
      this.x = config.currentTextboxConfig.对话框背景图片的X;
      this.y =
        this._messageWindow.y +
        4 +
        config.currentTextboxConfig.对话框背景图片的Y +
        config.currentTextboxConfig.windowYOffset;
    }
  }
}

const SuperSceneMessageForce = createConstructor(Scene_Message);
@SuperSceneMessageForce()
export class ExtendSceneMessageForce extends Scene_Message {
  resetAllWindow() {
    this._windowLayer.removeChildren(0, this._windowLayer.children.length);
    this.createAllWindows();
  }
}

const SuperSceneMessage = createConstructor(
  Scene_Message,
  () => config.enabled,
  (self: ExtendSceneMessage, current, prev) => {
    if (current !== prev) {
      console.log(current, prev);
      self.resetAllWindow();
      if (!current) {
        self.removeChild(self._msgBgSprite); //.re()
      } else {
        self.createWindowLayer();
        if (self._msgBgSprite) self._msgBgSprite.setWindow(self._messageWindow);
      }
    }
  }
);
@SuperSceneMessage()
export class ExtendSceneMessage extends ExtendSceneMessageForce {
  _nameBg: Sprite;
  _msgBgSprite: MessageBgSprite;
  opacity: number;

  createMsgBackground() {
    this._msgBgSprite = new MessageBgSprite();
    this._msgBgSprite.z = -1000;
    const layerIndex = this.children.indexOf(this._windowLayer);
    if (layerIndex > -1) {
      this.addChildAt(this._msgBgSprite, layerIndex);
    } else {
      this.addChild(this._msgBgSprite);
    }
  }

  createWindowLayer() {
    this.createMsgBackground();
    SuperSceneMessage.createWindowLayer();
  }

  createMessageWindow() {
    SuperSceneMessage.createMessageWindow();
    if (!this._msgBgSprite) {
      this.createMsgBackground();
    }
    if (this._msgBgSprite) this._msgBgSprite.setWindow(this._messageWindow);
  }

  messageWindowRect() {
    const ww = config.currentTextboxConfig.对话框宽度;
    const wh = config.currentTextboxConfig.对话框高度;
    const wx = (Graphics.boxWidth - ww) / 2;
    const wy = config.currentTextboxConfig.windowYOffset;
    return new Rectangle(wx, wy, ww, wh);
  }

  createNameBoxWindow() {
    SuperSceneMessage.createNameBoxWindow();
    this.createNameBg();
  }

  // 名字框背景
  createNameBg() {
    const bitmap = ImageManager.loadSystem(config.currentTextboxConfig.姓名图像名称);
    this._nameBg = new Sprite(bitmap);
    this._nameBg.x = config.currentTextboxConfig.姓名框图片的X;
    this._nameBg.y =
      config.currentTextboxConfig.姓名框图片的Y +
      (this._nameBoxWindow.windowHeight() + 10 - config.currentTextboxConfig.姓名框图片高度) / 2;
    this._nameBoxWindow.addChildToBack(this._nameBg);
  }

  __o: number;
  __helper: Yuyi919.Easing.EasingHelper;

  // 刷新
  update() {
    SuperSceneMessage.update();
    if (this._nameBg) {
      this._nameBg.scale.x =
        this._nameBoxWindow.windowWidth() / config.currentTextboxConfig.姓名框图片宽度;
      // self._nameBg.scale.y = self._nameBoxWindow.windowHeight() / config.currentConfig.姓名框图片高度 * 0.7;
    }
    if (this._msgBgSprite) {
      // if (
      // this._msgBgSprite.opacity < 255 &&
      // this._messageWindow.isOpen() &&
      // (!this.__helper || this.__helper.end !== 255)
      // ) {
      // const helper = Yuyi919.Easing.createEasingHelper("linear", this._msgBgSprite.opacity, 255, 20);
      // this.__helper = helper;
      // this.__o = 0;
      // } else if (
      // this._msgBgSprite.opacity > 0 &&
      // this._messageWindow.isClosing() &&
      // (!this.__helper || this.__helper.end !== 0)
      // ) {
      // const helper = Yuyi919.Easing.createEasingHelper("linear", this._msgBgSprite.opacity, 0, 20);
      // this.__helper = helper;
      // this.__o = 0;
      // } else if (this.__helper) {
      // this.__o++;
      // this._msgBgSprite.opacity = this.__helper.process(this.__o);
      // this._messageWindow.opacity = this._msgBgSprite.opacity;
      // console.log(this._msgBgSprite.opacity);
      // if (this.__o === this.__helper.duration) {
      // this.__helper = null;
      // }
      // }
    }
  }
}
const SuperSceneBattle = createConstructor(Scene_Battle);
@SuperSceneBattle()
export class ExtendSceneBattle extends ExtendSceneMessage {
  createMessageWindow() {
    SuperSceneBattle.createMessageWindow();
    if (!this._msgBgSprite) {
      this.createMsgBackground();
    }
    if (this._msgBgSprite) this._msgBgSprite.setWindow(this._messageWindow);
  }
  createWindowLayer() {
    this.createMsgBackground();
    SuperSceneBattle.createWindowLayer();
    console.log("createWindowLayer", this);
  }
}

const SuperNameBox = createConstructor(Window_NameBox, () => !!config.currentTextboxConfig);
@SuperNameBox()
export class ExtendWindowNameBox extends Window_NameBox {
  setBackgroundType() {
    this.opacity = 0;
    this.hideBackgroundDimmer();
  }
  // 姓名框位置
  updatePlacement() {
    this.width = this.windowWidth();
    this.height = this.windowHeight();
    const messageWindow = this._messageWindow;
    if (RMMZ.$gameMessage.isRTL()) {
      this.x =
        messageWindow.x + messageWindow.width - this.width + config.currentTextboxConfig.姓名框x;
    } else {
      this.x = messageWindow.x + config.currentTextboxConfig.姓名框x + 10;
    }
    // if (messageWindow.y > 0) {
    this.y =
      messageWindow.y -
      this.height +
      config.currentTextboxConfig.姓名框y +
      config.currentTextboxConfig.windowYOffset;
    // } else {
    //   self.y = messageWindow.y + messageWindow.height + config.currentConfig.姓名框y;
    // }
  }

  // 姓名框fontsize
  fittingHeight(numLines: number) {
    return (
      numLines * (config.currentTextboxConfig.姓名框fontsize + 10) +
      RMMZ.$gameSystem.windowPadding() * 2
    );
  }

  // 姓名框fontsize
  resetFontSettings() {
    SuperNameBox.resetFontSettings();
    this.contents.fontSize = config.currentTextboxConfig.姓名框fontsize;
    this.changeTextColor("lightskyblue");
  }
}

const SuperSceneMap = createConstructor(Scene_Map, () => !!config.currentTextboxConfig);
@SuperSceneMap()
export class ExtendSceneMap extends Scene_Map {
  update() {
    SuperSceneMap.update();
  }
}

// const SuperImageMnager = createStaticConstructor(ImageManager);
// @SuperImageMnager()
// export class NextImageManager extends ImageManager {
//   static loadBitmap = memoize(
//     (folder: string, filename: string) => {
//       // console.log("loadBitmap", folder, filename);
//       return SuperImageMnager.loadBitmap(folder, filename);
//     },
//     (...args) => args.join("||")
//   );
// }
// Yuyi919.proxyMethodAfter(RMMZ.Game_Message, "allText", (_, r) => {
//   // console.log(r)
//   return r.replaceAll("\\!", "\\W[SE]") + "\\W[30]\\^";
// });

const SuperWindowMessage = createConstructor(Window_Message, () => !!config.currentTextboxConfig);
@SuperWindowMessage()
export class Extract extends Window_Message {
  // 对话文本偏移量x
  newLineX(textState: TextState) {
    const faceExists = RMMZ.$gameMessage.faceName() !== "";
    const spacing = 20;
    const faceWidth = ImageManager.faceWidth;
    let result = SuperWindowMessage.newLineX(textState);
    if (faceExists) {
      result = result - (faceWidth + spacing);
    } else {
      result = result - 4;
    }
    result = result - 10 - 6;
    return (
      result +
      (config.currentTextboxConfig.脸图宽度 - ImageManager.faceWidth) +
      config.currentTextboxConfig.脸图x偏移量 +
      config.currentTextboxConfig.对话文本偏移量x
    );
  }

  // 脸图位置重写
  drawMessageFace() {
    const faceName = RMMZ.$gameMessage.faceName();
    const faceIndex = RMMZ.$gameMessage.faceIndex();
    const rtl = RMMZ.$gameMessage.isRTL();
    const width = ImageManager.faceWidth;
    const x = rtl ? this.innerWidth - width - 4 : 4;
    this.drawFace(
      faceName,
      faceIndex,
      x + config.currentTextboxConfig.脸图x偏移量,
      config.currentTextboxConfig.windowYOffset + config.currentTextboxConfig.脸图y偏移量,
      config.currentTextboxConfig.脸图宽度,
      config.currentTextboxConfig.脸图高度
    );
  }

  setBackgroundType() {
    this.opacity = 0;
    this.hideBackgroundDimmer();
  }

  // 对话文本偏移量y
  newPage(textState: TextState) {
    SuperWindowMessage.newPage(textState);
    textState.y =
      config.currentTextboxConfig.对话文本偏移量y + config.currentTextboxConfig.windowYOffset;
  }

  // 对话文本偏移量y
  processCharacter(textState: TextState) {
    const textMaxWidth =
      config.currentTextboxConfig.textMaxWidth ||
      this.width -
        (config.currentTextboxConfig.脸图宽度 +
          config.currentTextboxConfig.脸图x偏移量 +
          config.currentTextboxConfig.对话文本偏移量x +
          10 +
          RMMZ.$gameSystem.windowPadding() * 2 +
          20 +
          48);
    if (textState.outputWidth > textMaxWidth) {
      this.processNewLine(textState);
      textState.outputWidth = textState.startX;
    }
    SuperWindowMessage.processCharacter(textState);
  }
}
export default config;

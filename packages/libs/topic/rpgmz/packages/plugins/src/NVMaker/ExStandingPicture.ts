/* eslint-disable @typescript-eslint/no-unused-vars */
//-----------------------------------------------------------------------------
// ExStandingPicture
//
// 立ち絵を表示する独自のクラスを追加定義します。
import { Env } from "./Env";
import Core from "@yuyi919/rpgmz-core";

type TPicture = {
  imageName: any;
  scaleX: any;
  scaleY: any;
  reverse: any;
  origin: any;
  x: any;
  y: any;
  x2: any;
  y2: any;
  opacity: any;
  blendMode: any;
};
// アニメーションフレーム数定義
export const animationFrame = {
  yes: 24,
  yesyes: 48,
  no: 24,
  noslow: 48,
  jump: 24,
  jumpjump: 48,
  jumploop: 48,
  shake: 1,
  shakeloop: 1,
  runleft: 1,
  runright: 1,
  none: 0,
};
export type AnimationName = keyof typeof animationFrame;

export interface ITachieConfig {
  animationCount: number;
  _spSprite?: Core.Sprite;
  spriteSPicture?: TPicture;
  showSPicture: boolean;
  refSPicture: boolean;
  motionSPicture?: AnimationName;
  transition?: number;
  foreFront?: boolean;
}

export class TachieConfig implements ITachieConfig {
  transition?: number;
  foreFront?: boolean;

  _spSprite!: Core.Sprite;

  animationCount = 0;
  showSPicture = false;
  refSPicture = false;
  spriteSPicture!: TPicture;
  motionSPicture!: AnimationName;

  constructor(public pid: number, parameters: any) {
    this.transition = Number(parameters["transition"] || 1);
    this.foreFront = eval(parameters["foreFront"] || "false");
  }

  dispose() {
    this.showSPicture = false;
    this.motionSPicture = "none";
  }

  matchText(regExp: RegExp, regExp2: RegExp) {
    // 専用制御文字を取得
    let sPictureNumber: string | undefined;
    let processEscapeNumber = Core.$gameMessage.allText().match(regExp);
    if (processEscapeNumber) {
      if (processEscapeNumber[1]) {
        sPictureNumber = processEscapeNumber[1];
      }
    }
    // 専用制御文字を取得
    let sPictureMotion: AnimationName | undefined;
    processEscapeNumber = Core.$gameMessage.allText().match(regExp2);
    if (processEscapeNumber) {
      if (processEscapeNumber[1]) {
        sPictureMotion = processEscapeNumber[1] as any;
      }
    }
    return { sPictureNumber, sPictureMotion };
  }

  effect({
    sPictureNumber,
    sPictureMotion,
  }: {
    sPictureNumber?: string;
    sPictureMotion?: AnimationName;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const config = this;
    // 立ち絵1を更新
    if (sPictureNumber) {
      const sPicture = Env.sPictureLists.find(function (item, index) {
        if (String(item.id) == sPictureNumber) return true;
      });
      if (sPicture) {
        config.spriteSPicture = sPicture;
        config.showSPicture = true;
        config.refSPicture = true;
      } else {
        config.showSPicture = false;
        config.refSPicture = false;
      }
      // 再生モーション定義
      config.motionSPicture = sPictureMotion ? sPictureMotion : "none";
      config.animationCount = animationFrame[config.motionSPicture];
    } else {
      config.showSPicture = false;
      config.motionSPicture = "none";
    }
  }

  create(elm: Core.Scene_Message) {
    // 立ち絵
    this._spSprite = new Core.Sprite();
    this._spSprite.bitmap = null;
    this._spSprite.opacity = 0;
    this._spSprite.opening = false;
    this._spSprite.closing = false;
    this._spSprite.originX = 0;
    this._spSprite.originY = 0;
    this._spSprite.showing = false;
    // 重なり順を指定
    if (this.foreFront) {
      elm.addChildAt(this._spSprite, elm.children.indexOf(elm._windowLayer) + 1);
    } else {
      elm.addChildAt(this._spSprite, elm.children.indexOf(elm._spriteset) + 1);
    }
  }

  setColorTone(tone: number[]) {
    return this._spSprite.setColorTone(Array.from(tone) as MZ.RGBAColorArray);
  }

  update() {
    // 立ち絵を非表示に設定している場合、処理を中断
    if (Env._StandingPictureDisabled) {
      this._spSprite.opacity = 0;
      return;
    }

    // 立ち絵ピクチャ作成
    if (this.spriteSPicture && this.refSPicture) {
      this.refresh(this.spriteSPicture);
      this.refSPicture = false;
    }

    // フォーカス処理
    if (typeof Env.focusId === "number" && Env.focusId !== this.pid) {
      this.setColorTone([
        Env._StandingPictureTone
          ? Env._StandingPictureTone[0] + Env.focusToneAdjust
          : Env.focusToneAdjust,
        Env._StandingPictureTone
          ? Env._StandingPictureTone[1] + Env.focusToneAdjust
          : Env.focusToneAdjust,
        Env._StandingPictureTone
          ? Env._StandingPictureTone[2] + Env.focusToneAdjust
          : Env.focusToneAdjust,
        Env._StandingPictureTone ? Env._StandingPictureTone[3] : 0,
      ]);
    }

    // フェード処理
    if (this.showSPicture) {
      this.fadeIn(this.spriteSPicture);
    } else {
      this.fadeOut(this.spriteSPicture);
    }

    // 立ち絵モーション再生
    if (!this._spSprite.opening && !this._spSprite.closing && this.animationCount > 0) {
      this.animationCount = this.animation(
        this._spSprite,
        this.motionSPicture,
        this.animationCount
      );
    }

    //console.log("[1] x:" + elm._spSprite.x + " y:" + elm._spSprite.y + " opacity:" + elm._spSprite.opacity + " motion: " + motionSPicture + " opening: " + elm._spSprite.opening + " closing: " + elm._spSprite.closing + " scaleX: " + elm._spSprite.scale.x);
    //console.log("[2] x:" + elm._spSprite2.x + " y:" + elm._spSprite2.y + " opacity:" + elm._spSprite2.opacity + " motion: " + motionSPicture2 + " opening: " + elm._spSprite2.opening + " closing: " + elm._spSprite2.closing + " scaleX: " + elm._spSprite2.scale.x);
  }

  refresh(sPicture: TPicture) {
    const sSprite = this._spSprite;
    const { ImageManager, SceneManager } = Core;
    sSprite.bitmap = null;
    sSprite.bitmap = ImageManager.loadPicture(sPicture.imageName);
    sSprite.showing = false;
    let calcScaleX = Number(sPicture.scaleX);
    let calcScaleY = Number(sPicture.scaleY);
    const sceenHeight = SceneManager._scene._spriteset.height;
    if (sceenHeight < sSprite.bitmap.height) {
      console.log(sceenHeight / sSprite.bitmap.height);
    }
    // 左右反転させる場合 (立ち絵2)
    if (this.pid > 0) calcScaleX *= Number(sPicture.reverse);
    // 画像が読み込まれたあとに実行
    sSprite.bitmap.addLoadListener(() => {
      const sceenHeight = SceneManager._scene._spriteset.height;
      if (sceenHeight < sSprite.bitmap.height) {
        const scale = sceenHeight / sSprite.bitmap.height;
        calcScaleX *= scale;
        calcScaleY *= scale;
      }
      if (Number(sPicture.origin) == 0) {
        // 左上原点
        if (this.pid > 0) {
          sSprite.x = Number(sPicture.x);
          sSprite.y = Number(sPicture.y);
          sSprite.originX = Number(sPicture.x);
          sSprite.originY = Number(sPicture.y);
        } else {
          sSprite.x = Number(sPicture.x2);
          sSprite.y = Number(sPicture.y2);
          sSprite.originX = Number(sPicture.x2);
          sSprite.originY = Number(sPicture.y2);
        }
      } else {
        // 中央原点
        if (this.pid > 0) {
          sSprite.x = Number(sPicture.x) - (sSprite.width * calcScaleX) / 100 / 2;
          sSprite.y = Number(sPicture.y) - (sSprite.height * calcScaleY) / 100 / 2;
          sSprite.originX = Number(sPicture.x) - (sSprite.width * calcScaleX) / 100 / 2;
          sSprite.originY = Number(sPicture.y) - (sSprite.height * calcScaleY) / 100 / 2;
        } else {
          sSprite.x = Number(sPicture.x2) - (sSprite.width * calcScaleX) / 100 / 2;
          sSprite.y = Number(sPicture.y2) - (sSprite.height * calcScaleY) / 100 / 2;
          sSprite.originX = Number(sPicture.x2) - (sSprite.width * calcScaleX) / 100 / 2;
          sSprite.originY = Number(sPicture.y2) - (sSprite.height * calcScaleY) / 100 / 2;
        }
      }
      // 切替効果
      if (sSprite.opacity == 0) {
        if (this.transition == 0) sSprite.opacity = Number(sPicture.opacity);
        if (this.transition == 2) sSprite.x -= 30;
        if (this.transition == 3) sSprite.x += 30;
        if (this.transition == 4) sSprite.y += 30;
        if (this.transition == 5) sSprite.y -= 30;
      }
      sSprite.blendMode = Number(sPicture.blendMode);
      this.setColorTone(Env._StandingPictureTone || Array.from([0, 0, 0, 0]));
      sSprite.scale.x = calcScaleX / 100;
      sSprite.scale.y = calcScaleY / 100;
      sSprite.showing = true;
    });
  }
  fadeIn(sPicture: TPicture) {
    const sSprite = this._spSprite;
    if (!sSprite.showing) return;
    if (sSprite.opacity >= Number(sPicture.opacity)) {
      sSprite.opening = false;
      sSprite.opacity = Number(sPicture.opacity);
      return;
    }
    sSprite.opening = true;
    sSprite.closing = false;
    // 切替効果
    if (sSprite.originX > sSprite.x) sSprite.x += 2;
    if (sSprite.originX < sSprite.x) sSprite.x -= 2;
    if (sSprite.originY < sSprite.y) sSprite.y -= 2;
    if (sSprite.originY > sSprite.y) sSprite.y += 2;
    sSprite.opacity += Number(sPicture.opacity) / 15;
  }

  fadeOut(sPicture: any) {
    const sSprite = this._spSprite;
    if (sSprite.opacity == 0) {
      sSprite.closing = false;
      return;
    }
    sSprite.closing = true;
    if (!sPicture) {
      sSprite.opacity = 0;
      return;
    }
    sSprite.opacity -= Number(sPicture.opacity) / 15;
    // 切替効果
    if (this.transition == 0) sSprite.opacity = 0;
    if (this.transition == 2 && sSprite.originX - 30 < sSprite.x) sSprite.x -= 2;
    if (this.transition == 3 && sSprite.originX + 30 > sSprite.x) sSprite.x += 2;
    if (this.transition == 4 && sSprite.originY + 30 > sSprite.y) sSprite.y += 2;
    if (this.transition == 5 && sSprite.originY - 30 < sSprite.y) sSprite.y -= 2;
  }

  animation(sSprite: Core.Sprite, sMotion: AnimationName, animationCount: number) {
    if (!sSprite.showing) return animationCount;
    if (sMotion == "yes") {
      if (animationCount > 12) {
        sSprite.y += 2;
      } else {
        sSprite.y -= 2;
      }
      animationCount -= 1;
    }
    if (sMotion == "yesyes") {
      if (animationCount > 36) {
        sSprite.y += 2;
      } else if (animationCount > 24) {
        sSprite.y -= 2;
      } else if (animationCount > 12) {
        sSprite.y += 2;
      } else {
        sSprite.y -= 2;
      }
      animationCount -= 1;
    }
    if (sMotion == "no") {
      if (animationCount > 18) {
        sSprite.x += 2;
      } else if (animationCount > 6) {
        sSprite.x -= 2;
      } else {
        sSprite.x += 2;
      }
      animationCount -= 1;
    }
    if (sMotion == "noslow") {
      if (animationCount > 36) {
        sSprite.x += 1;
      } else if (animationCount > 12) {
        sSprite.x -= 1;
      } else {
        sSprite.x += 1;
      }
      animationCount -= 1;
    }
    if (sMotion == "jump") {
      if (animationCount > 12) {
        sSprite.y -= 2;
      } else {
        sSprite.y += 2;
      }
      animationCount -= 1;
    }
    if (sMotion == "jumpjump") {
      if (animationCount > 36) {
        sSprite.y -= 2;
      } else if (animationCount > 24) {
        sSprite.y += 2;
      } else if (animationCount > 12) {
        sSprite.y -= 2;
      } else {
        sSprite.y += 2;
      }
      animationCount -= 1;
    }
    if (sMotion == "jumploop") {
      if (animationCount > 36) {
        sSprite.y -= 2;
      } else if (animationCount > 24) {
        sSprite.y += 2;
      }
      animationCount -= 1;
      if (animationCount == 0) animationCount = 48;
    }
    if (sMotion == "shake") {
      if (animationCount <= 2) {
        sSprite.x -= 2;
        animationCount += 1;
      } else if (animationCount <= 4) {
        sSprite.y -= 2;
        animationCount += 1;
      } else if (animationCount <= 6) {
        sSprite.x += 4;
        sSprite.y += 4;
        animationCount += 1;
      } else if (animationCount <= 8) {
        sSprite.y -= 2;
        animationCount += 1;
      } else if (animationCount == 9) {
        sSprite.x -= 2;
        animationCount += 1;
      } else if (animationCount == 10) {
        sSprite.x -= 2;
        animationCount = 0;
      }
    }
    if (sMotion == "shakeloop") {
      if (animationCount <= 2) {
        sSprite.x -= 1;
        animationCount += 1;
      } else if (animationCount <= 4) {
        sSprite.y -= 1;
        animationCount += 1;
      } else if (animationCount <= 6) {
        sSprite.x += 2;
        sSprite.y += 2;
        animationCount += 1;
      } else if (animationCount <= 8) {
        sSprite.y -= 1;
        animationCount += 1;
      } else if (animationCount <= 10) {
        sSprite.x -= 1;
        animationCount += 1;
      }
      if (animationCount > 10) animationCount = 1;
    }
    if (sMotion == "runleft") {
      sSprite.x -= 16;
      if (sSprite.x < -2000) animationCount = 0;
    }
    if (sMotion == "runright") {
      sSprite.x += 16;
      if (sSprite.x > 2000) animationCount = 0;
    }
    return animationCount;
  }
}

export let global: Readonly<Yuyi919.Global>;
export class ExStandingPicture {
  static Env = Env;
  static init = Env.init;

  static create(elm: Core.Scene_Message) {
    // 立ち絵1
    Env.GlobalTachieConfig.left.create(elm);
    // 立ち絵2
    Env.GlobalTachieConfig.right.create(elm);
  }

  static update() {
    // 立ち絵1
    Env.GlobalTachieConfig.left.update();
    // 立ち絵2
    Env.GlobalTachieConfig.right.update();
  }

  static handleMessage() {
    // 専用制御文字を取得 (\FL[s]), (\ML[s])
    const left = Env.GlobalTachieConfig.left.matchText(/\\FL\[(\w+)\]/, /\\ML\[(\w+)\]/);
    // 専用制御文字を取得 (\FR[s]), (\MR[s])
    const right = Env.GlobalTachieConfig.right.matchText(/\\FR\[(\w+)\]/, /\\MR\[(\w+)\]/);
    // 専用制御文字を取得 (\FF[s])
    checkFocusPicture(global);
    // 立ち絵-Leftを更新
    Env.GlobalTachieConfig.left.effect(left);
    // 立ち絵-Rightを更新
    Env.GlobalTachieConfig.right.effect(right);
  }
}

function checkFocusPicture(global: Readonly<Yuyi919.Global>) {
  const processEscapeNumber: RegExpMatchArray | null = Core.$gameMessage
    .allText()
    .match(/\\FF\[(\w+)\]/);
  if (processEscapeNumber) {
    if (processEscapeNumber[1]) {
      const t = processEscapeNumber[1];
      // v2.1.0 \FF[L]、\FF[R]を置換
      if (t == "L") return (Env.focusId = -1);
      else if (t == "R") return (Env.focusId = 1);
    }
  }
  return (Env.focusId = null);
}

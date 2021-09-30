import { ImageManager } from "./";
import { Bitmap } from "../pixi";
import { Game_Battler } from "../game";


//-----------------------------------------------------------------------------
// ColorManager
//
// The static class that handles the window colors.

export class ColorManager {
  static _windowskin: Bitmap | null = null;

  static loadWindowskin(): void {
    this._windowskin = ImageManager.loadSystem("Window");
  }

  static textColor(n: number): MZ.HexColorString {
    const px = 96 + (n % 8) * 12 + 6;
    const py = 144 + Math.floor(n / 8) * 12 + 6;
    return this._windowskin!.getPixel(px, py);
  }

  static normalColor(): MZ.HexColorString {
    return this.textColor(0);
  }

  static systemColor(): MZ.HexColorString {
    return this.textColor(16);
  }

  static crisisColor(): MZ.HexColorString {
    return this.textColor(17);
  }

  static deathColor(): MZ.HexColorString {
    return this.textColor(18);
  }

  static gaugeBackColor(): MZ.HexColorString {
    return this.textColor(19);
  }

  static hpGaugeColor1(): MZ.HexColorString {
    return this.textColor(20);
  }

  static hpGaugeColor2(): MZ.HexColorString {
    return this.textColor(21);
  }

  static mpGaugeColor1(): MZ.HexColorString {
    return this.textColor(22);
  }

  static mpGaugeColor2(): MZ.HexColorString {
    return this.textColor(23);
  }

  static mpCostColor(): MZ.HexColorString {
    return this.textColor(23);
  }

  static powerUpColor(): MZ.HexColorString {
    return this.textColor(24);
  }

  static powerDownColor(): MZ.HexColorString {
    return this.textColor(25);
  }

  static ctGaugeColor1(): MZ.HexColorString {
    return this.textColor(26);
  }

  static ctGaugeColor2(): MZ.HexColorString {
    return this.textColor(27);
  }

  static tpGaugeColor1(): MZ.HexColorString {
    return this.textColor(28);
  }

  static tpGaugeColor2(): MZ.HexColorString {
    return this.textColor(29);
  }

  static tpCostColor(): MZ.HexColorString {
    return this.textColor(29);
  }

  static pendingColor(): MZ.HexColorString {
    return this._windowskin!.getPixel(120, 120);
  }

  static hpColor(actor: Game_Battler): MZ.HexColorString {
    if (!actor) {
      return this.normalColor();
    } else if (actor.isDead()) {
      return this.deathColor();
    } else if (actor.isDying()) {
      return this.crisisColor();
    } else {
      return this.normalColor();
    }
  }

  static mpColor(actor: Game_Battler): MZ.HexColorString {
    return this.normalColor();
  }

  static tpColor(actor: Game_Battler): MZ.HexColorString {
    return this.normalColor();
  }

  static paramchangeTextColor(change: number): MZ.HexColorString {
    if (change > 0) {
      return this.powerUpColor();
    } else if (change < 0) {
      return this.powerDownColor();
    } else {
      return this.normalColor();
    }
  }

  static damageColor(colorType: MZ.DamageColorType): MZ.HexColorString {
    switch (colorType) {
      case 0: // HP damage
        return "#ffffff";
      case 1: // HP recover
        return "#b9ffb5";
      case 2: // MP damage
        return "#ffff90";
      case 3: // MP recover
        return "#80b0ff";
      default:
        return "#808080";
    }
  }

  static outlineColor(): MZ.RGBAColorString {
    return "rgba(0, 0, 0, 0.6)";
  }

  static dimColor1(): MZ.RGBAColorString {
    return "rgba(0, 0, 0, 0.6)";
  }

  static dimColor2(): MZ.RGBAColorString {
    return "rgba(0, 0, 0, 0)";
  }

  static itemBackColor1(): MZ.RGBAColorString {
    return "rgba(32, 32, 32, 0.5)";
  }

  static itemBackColor2(): MZ.RGBAColorString {
    return "rgba(0, 0, 0, 0.5)";
  }
}

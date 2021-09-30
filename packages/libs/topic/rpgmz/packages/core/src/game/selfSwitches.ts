import { $gameMap } from "../managers";
import { MZ } from "../MZ";


//-----------------------------------------------------------------------------
// Game_SelfSwitches
//
// The game object class for self switches.

export class Game_SelfSwitches {
  _data: { [key: string]: boolean } = {};

  constructor();
  constructor(thisClass: Constructable<Game_SelfSwitches>);
  constructor(arg?: any) {
    if (arg === Game_SelfSwitches) {
      return;
    }
    this.initialize();
  }

  initialize(): void {
    this.clear();
  }

  clear(): void {
    this._data = {};
  }

  value(key: MZ.SelfSwitchData): boolean {
    return !!this._data[String(key)];
  }

  setValue(key: MZ.SelfSwitchData, value: boolean): void {
    if (value) {
      this._data[String(key)] = true;
    } else {
      delete this._data[String(key)];
    }
    this.onChange();
  }

  onChange(): void {
    $gameMap.requestRefresh();
  }
}

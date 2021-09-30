import { Window_ItemList } from ".";
import { MZ } from "../MZ";
import { Rectangle } from "../pixi";

//-----------------------------------------------------------------------------
// Window_ShopSell
//
// The window for selecting an item to sell on the shop screen.

export class Window_ShopSell extends Window_ItemList {
  constructor(rect: Rectangle);
  constructor(thisClass: Constructable<Window_ShopSell>);
  constructor(arg?: any) {
    super(Window_ItemList);
    if (arg === Window_ShopSell) {
      return;
    }
    this.initialize(arg);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
  }

  isEnabled(item: MZ.DataItem | MZ.DataEquipItem | null): boolean {
    return !!item && item.price > 0;
  }
}

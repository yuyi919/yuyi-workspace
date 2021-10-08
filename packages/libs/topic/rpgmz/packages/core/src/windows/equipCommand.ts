import { Window_HorzCommand } from ".";
import { TextManager } from "../managers";
import { RectangleLike } from "../pixi";
import { SelectableSymbols } from "./selectable";

//-----------------------------------------------------------------------------
// Window_EquipCommand
//
// The window for selecting a command on the equipment screen.
type Internal = SelectableSymbols<"equip" | "optimize" | "clear">;
export class Window_EquipCommand<
  Symbols extends Internal = Internal
> extends Window_HorzCommand<Symbols> {
  constructor(rect: RectangleLike);
  constructor(thisClass: typeof Window_EquipCommand);
  constructor(arg?: RectangleLike | typeof Window_EquipCommand) {
    super(Window_HorzCommand);
    if (arg !== Window_EquipCommand) {
      this.initialize(arg as RectangleLike);
    }
  }

  initialize(rect?: RectangleLike): void {
    super.initialize(rect);
  }

  maxCols(): number {
    return 3;
  }

  makeCommandList(): void {
    this.addCommand(TextManager.equip2, "equip" as Symbols);
    this.addCommand(TextManager.optimize, "optimize" as Symbols);
    this.addCommand(TextManager.clear, "clear" as Symbols);
  }
}

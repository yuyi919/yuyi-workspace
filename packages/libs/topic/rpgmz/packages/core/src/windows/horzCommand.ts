import { Window_Command } from ".";
import { RectangleLike } from "../pixi";
import { SelectableSymbols } from "./selectable";

//-----------------------------------------------------------------------------
// Window_HorzCommand
//
// The command window for the horizontal selection format.

export abstract class Window_HorzCommand<Symbols extends SelectableSymbols = SelectableSymbols> extends Window_Command<Symbols> {
  constructor(rect: RectangleLike);
  constructor(thisClass: typeof Window_HorzCommand);
  constructor(arg?: RectangleLike | typeof Window_HorzCommand) {
    super(Window_Command);
    if (arg !== Window_HorzCommand) {
      this.initialize(arg as RectangleLike);
    }
  }

  initialize(rect?: RectangleLike): void {
    super.initialize(rect);
  }

  maxCols(): number {
    return 4;
  }

  itemTextAlign(): CanvasTextAlign {
    return "center";
  }
}

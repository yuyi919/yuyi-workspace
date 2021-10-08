import { Window_Selectable, SelectableSymbols } from "./selectable";
import { RectangleLike } from "../pixi";

interface WindowCommand<Symbols extends SelectableSymbols = SelectableSymbols> {
  name: string;
  symbol: Symbols;
  enabled: boolean;
  ext: any;
}

//-----------------------------------------------------------------------------
// Window_Command
//
// The superclass of windows for selecting a command.

export abstract class Window_Command<Symbols extends SelectableSymbols = SelectableSymbols> extends Window_Selectable<Symbols> {
  _list: WindowCommand<Symbols>[] = [];

  constructor(rect: RectangleLike);
  constructor(thisClass: typeof Window_Command);
  constructor(arg?: any) {
    super(Window_Selectable);
    if (arg !== Window_Command) {
      this.initialize(arg);
    }
  }

  initialize(rect?: RectangleLike): void {
    super.initialize(rect);
    this.refresh();
    this.select(0);
    this.activate();
  }

  maxItems(): number {
    return this._list.length;
  }

  clearCommandList(): void {
    this._list = [];
  }

  /**
   * 创建命令选项，抽象方法
   */
  abstract makeCommandList(): void;

  addCommand(name: string, symbol: Symbols, enabled: boolean = true, ext: any = null) {
    this._list.push({ name: name, symbol: symbol, enabled: enabled, ext: ext });
  }

  commandName(index: number): string {
    return this._list[index].name;
  }

  commandSymbol(index: number): string {
    return this._list[index].symbol;
  }

  isCommandEnabled(index: number): boolean {
    return this._list[index].enabled;
  }

  currentData(): WindowCommand<Symbols> | null {
    return this.index() >= 0 ? this._list[this.index()] : null;
  }

  isCurrentItemEnabled(): boolean {
    return this.currentData() ? this.currentData()!.enabled : false;
  }

  currentSymbol(): Symbols | null {
    return this.currentData() ? this.currentData()!.symbol : null;
  }

  currentExt(): any {
    return this.currentData() ? this.currentData()!.ext : null;
  }

  findSymbol(symbol: string | null): number {
    return this._list.findIndex((item) => item.symbol === symbol);
  }

  selectSymbol(symbol: string | null): void {
    const index = this.findSymbol(symbol);
    if (index >= 0) {
      this.forceSelect(index);
    } else {
      this.forceSelect(0);
    }
  }

  findExt(ext: any): number {
    return this._list.findIndex((item) => item.ext === ext);
  }

  selectExt(ext: any): void {
    const index = this.findExt(ext);
    if (index >= 0) {
      this.forceSelect(index);
    } else {
      this.forceSelect(0);
    }
  }

  drawItem(index: number): void {
    const rect = this.itemLineRect(index);
    const align = this.itemTextAlign();
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));
    this.drawText(this.commandName(index), rect.x, rect.y, rect.width, align);
  }

  itemTextAlign(): CanvasTextAlign {
    return "center";
  }

  isOkEnabled(): boolean {
    return true;
  }

  callOkHandler(): void {
    const symbol = this.currentSymbol();
    if (this.isHandled(symbol)) {
      this.callHandler(symbol);
    } else if (this.isHandled("ok" as Symbols)) {
      super.callOkHandler();
    } else {
      this.activate();
    }
  }

  refresh(): void {
    this.clearCommandList();
    this.makeCommandList();
    super.refresh();
  }
}

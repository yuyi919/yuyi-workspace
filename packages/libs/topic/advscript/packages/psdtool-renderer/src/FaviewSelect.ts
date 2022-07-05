import { INode } from "./FavoriteTree";

export class FaviewSelect {
  _selectedIndex = 0;
  lastmod?: number;
  constructor(
    private readonly _select: INode,
    private readonly _changed: (sel: FaviewSelect) => void,
    public readonly caption: string,
    public readonly items: IFaviewSelectItem[]
  ) {}

  get selectedIndex(): number {
    return this._selectedIndex;
  }
  set selectedIndex(v: number) {
    this._selectedIndex = v;
    this.lastmod = Date.now();
    this._changed(this);
  }
  get value(): string {
    return this.valueByIndex(this._selectedIndex);
  }

  get selectedName(): string {
    return this._select.children[this._selectedIndex].caption!;
  }

  set selectedName(caption) {
    const index = this._select.children.findIndex((node) => node.caption === caption);
    if (index > -1) {
      this._selectedIndex = index;
      this.lastmod = Date.now();
      this._changed(this);
    }
  }

  valueByIndex(index: number): string {
    return this._select.children[index]!.id!;
  }
}
export interface IFaviewSelectItem {
  name: string;
  value: string;
}

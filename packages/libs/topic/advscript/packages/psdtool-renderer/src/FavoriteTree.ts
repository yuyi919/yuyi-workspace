import * as crc32 from "./crc32";
import { FaviewSelect, IFaviewSelectItem } from "./FaviewSelect";
import { JSONBuilder } from "./JSONBuilder";
export interface IPFVOnLS {
  id: string;
  time: number;
  hash: string;
  data: string;
}
export interface INode {
  id?: string;
  text: string;
  type?: string;
  data?: {
    value: string;
  };
  state?: {
    opened: boolean;
  };
  children: INode[];
  parent?: INode | string;
  caption?: string;
}
export interface IRenameNode {
  id: string;
  text: string;
  originalText: string;
  children: IRenameNode[];
}
const enum FaviewMode {
  ShowLayerTree,
  ShowFaview,
  ShowFaviewAndReadme
}
// https://gist.github.com/boushley/5471599
function arrayBufferToString(ab: ArrayBuffer): string {
  const data = new Uint8Array(ab);

  // If we have a BOM skip it
  let s = "",
    i = 0,
    c = 0,
    c2 = 0,
    c3 = 0;
  if (data.length >= 3 && data[0] === 0xef && data[1] === 0xbb && data[2] === 0xbf) {
    i = 3;
  }
  while (i < data.length) {
    c = data[i];

    if (c < 128) {
      s += String.fromCharCode(c);
      i++;
    } else if (c > 191 && c < 224) {
      if (i + 1 >= data.length) {
        throw "UTF-8 Decode failed. Two byte character was truncated.";
      }
      c2 = data[i + 1];
      s += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
      i += 2;
    } else {
      if (i + 2 >= data.length) {
        throw "UTF-8 Decode failed. Multi byte character was truncated.";
      }
      c2 = data[i + 1];
      c3 = data[i + 2];
      s += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      i += 3;
    }
  }
  return s;
}

export interface IFaviewRootItem {
  name: string;
  value: string;
  selects: FaviewSelect[];
}

export interface IUpdataDataRecord {
  root: number | string;
  [key: string]: number | string;
}
export class DataTree {
  onChange?: (changedNode?: INode) => void;
  _cache = {} as Record<string, INode>;
  items: IFaviewRootItem[] = [];
  data: INode[] = [];

  dataStore = {
    root: 0
  } as IUpdataDataRecord;

  loadData(data: INode[]) {
    this.data = this.mapEachTree(
      data,
      (data) =>
        (this._cache[data.id!] = {
          ...data,
          caption: data.text.replace(/^\*/, "")
        })
    );
    this.items = this.getItems();
  }

  get root() {
    const { root } = this.dataStore;
    return typeof root === "number"
      ? this.items[root]
      : this.items.find((item) => item.name === root)!;
  }

  reversePart(target: string) {
    const rootList = this.data[0].children!;
    for (let i = 0; i < rootList.length; ++i) {
      const selects = rootList[i].children!;
      for (let j = 0; j < selects.length; ++j) {
        if (selects[j].caption === target) {
          selects[j].children.reverse();
          this.onChange?.(selects[j].children![0]!);
          break;
        }
      }
    }
  }

  updateData(data: IUpdataDataRecord) {
    for (const key in data) {
      const nextValue = data[key];
      if (nextValue !== this.dataStore[key]) {
        if (key === "root") {
          this.dataStore[key] = nextValue!;
          this.onChange?.();
          continue;
        }
        const select = this.root.selects.find((data) => data.caption === key);
        if (select) {
          if (typeof nextValue === "number") {
            select.selectedIndex = nextValue;
          } else if (typeof nextValue === "string") {
            select.selectedName = nextValue;
          }
          continue;
        }
        console.warn("未知的参数名称：" + key, nextValue);
      }
    }
  }

  public get_node(node?: INode): INode;
  public get_node(id?: string): INode;
  public get_node(p: any): INode {
    return this._cache[p instanceof Object ? p.id : p] as INode;
  }

  getItems(): IFaviewRootItem[] {
    const r: IFaviewRootItem[] = [];
    const rootList = this.data[0].children!;
    for (let i = 0; i < rootList.length; ++i) {
      const fsels: FaviewSelect[] = [];
      const selects = rootList[i].children!;
      for (let j = 0; j < selects.length; ++j) {
        const sel = selects[j];
        const caption = sel.caption;
        if (!caption) {
          throw new Error("could not get caption");
        }
        const items: IFaviewSelectItem[] = [];
        for (let k = 0; k < sel.children!.length; ++k) {
          const opt = sel.children[k];
          items.push({
            name: opt!.caption || "",
            value: opt!.id!
          });
        }
        fsels.push(
          new FaviewSelect(sel, (sel) => this.onChange?.(this.get_node(sel.value)), caption, items)
        );
      }

      const opt = rootList[i];
      r.push({
        name: opt!.caption || "",
        value: opt!.id!,
        selects: fsels
      });
    }
    return r;
  }
  mapEachTree(
    columns: INode[],
    map: (col: INode, isGroup: boolean) => INode | boolean,
    parent?: string,
    context = { i: 0, keys: { node$: true } as Record<string, true> }
  ): INode[] {
    return columns
      .map((data) => {
        let key = data.id ?? "node$";
        if (context.keys[key]) {
          key += context.i++;
        } else {
          context.keys[key] = true;
        }
        const group = !!data.children?.length;
        if (group) {
          const children = data.children && this.mapEachTree(data.children, map, key, context);
          return (
            children?.length &&
            map(
              {
                id: key,
                ...data,
                parent,
                children
              },
              group
            )
          );
        }
        return map(
          {
            id: key,
            ...data,
            parent,
            children: []
          },
          group
        );
      })
      .filter(Boolean) as INode[];
  }
}

export class PfvTree {
  public psdHash = "";

  public onModified: () => void;
  public onLoaded: () => void;
  public onClearSelection: () => void;
  public onSelect: (item: INode) => void;
  public onDoubleClick: (item: INode) => void;

  public faviewMode: FaviewMode = FaviewMode.ShowFaview;
  jst: DataTree = new DataTree();

  get json(): INode[] {
    return this.jst.data;
  }

  get pfv(): string {
    const json = this.json;
    if (json.length !== 1) {
      throw new Error("sorry but favorite tree data is broken");
    }

    const path: string[] = [];
    const lines = ["[PSDToolFavorites-v1]"];
    const r = (children: INode[]): void => {
      for (const item of children) {
        path.push(JSONBuilder.encodeName(item.text));
        switch (item.type) {
          case "root":
            lines.push("root-name/" + path[0]);
            lines.push("faview-mode/" + this.faviewMode.toString());
            lines.push("");
            path.pop();
            if (item.children && item.children.length) {
              r(item.children as INode[]);
            }
            path.push("");
            break;
          case "folder":
            if (item.children && item.children.length) {
              r(item.children as INode[]);
            } else {
              lines.push("//" + path.join("/") + "~folder");
              lines.push("");
            }
            break;
          case "filter":
            lines.push("//" + path.join("/") + "~filter");
            if (item.data && item.data.value) {
              lines.push(item.data.value);
            }
            lines.push("");
            if (item.children && item.children.length) {
              r(item.children as INode[]);
            }
            break;
          case "item":
            lines.push("//" + path.join("/"));
            if (item.data && item.data.value) {
              lines.push(item.data.value);
            }
            lines.push("");
            break;
        }
        path.pop();
      }
    };
    r(json);
    return lines.join("\n");
  }

  constructor(private _defaultRootName: string = "root") {}

  public getActive(): INode[] {
    const selects = this.jst.root.selects;
    // const items: { n: Node; lastMod: number }[] = [];
    const nodes: INode[] = [];
    for (let i = 0; i < selects.length; ++i) {
      const node = this.jst.get_node(selects[i].value);
      // items.push({
      //   n: node,
      //   lastMod: selects[i].lastmod || 0
      // });
      nodes.push(node);
    }
    // items.sort((a, b): number =>
    //   a.lastMod === b.lastMod ? 0 : a.lastMod < b.lastMod ? -1 : 1
    // );
    // for (let i of items) {
    //   nodes.push(i.n);
    // }
    return nodes;
  }

  public getFirstFilter(n: INode): string {
    for (const p of this._getParents(n, "filter")) {
      if (p.data) {
        return p.data.value;
      }
    }
    return "";
  }

  public getAncestorFilters(n: INode): string[] {
    const r: string[] = [];
    for (const p of this._getParents(n, "filter")) {
      if (p.data) {
        r.push(p.data.value);
      }
    }
    return r;
  }

  private _getParents(n: INode, typeFilter?: string): INode[] {
    const parents: INode[] = [];
    for (
      let p = this.jst.get_node(n.parent as string);
      p;
      p = this.jst.get_node(p.parent as string)
    ) {
      if (typeFilter === undefined || typeFilter === p.type) {
        parents.push(p);
      }
    }
    return parents;
  }

  private _initTree(
    loaded?: () => void,
    data: INode[] = new JSONBuilder(this._defaultRootName).json
  ): void {
    this.jst.loadData(data);
    console.log(this);
    // this.jq.jstree("destroy");
    // this.jq.jstree({
    //   core: {
    //     animation: false,
    //     check_callback: this.jstCheck,
    //     dblclick_toggle: false,
    //     themes: {
    //       dots: false
    //     },
    //     data: data ? data : new JSONBuilder(this.defaultRootName).json
    //   },
    //   types: {
    //     root: {
    //       icon: false
    //     },
    //     item: {
    //       icon: "glyphicon glyphicon-picture"
    //     },
    //     folder: {
    //       icon: "glyphicon glyphicon-folder-open"
    //     },
    //     filter: {
    //       icon: "glyphicon glyphicon-filter"
    //     }
    //   },
    //   plugins: ["types", "dnd", "wholerow"]
    // });
    // this.jst = this.jq.jstree();
  }

  public loadFromArrayBuffer(ab: ArrayBuffer): boolean {
    return this.loadFromString(arrayBufferToString(ab), "pfv" + crc32.crc32(ab).toString(16));
  }

  public loadFromString(s: string, uniqueId?: string): boolean {
    const r = this._stringToNodeTree(s);
    this._initTree((): void => {
      // this.uniqueId = uniqueId;
      this.faviewMode = r.faviewMode;
      if (this.onLoaded) {
        this.onLoaded();
      }
    }, r.root);
    return true;
  }

  private _stringToNodeTree(s: string): {
    root: INode[];
    faviewMode: FaviewMode;
  } {
    const lines = s.replace(/\r/g, "").split("\n");
    if (lines.shift() !== "[PSDToolFavorites-v1]") {
      throw new Error("given PFV file does not have a valid header");
    }

    const jb = new JSONBuilder(this._defaultRootName);
    const setting: { [name: string]: string } = {
      "root-name": this._defaultRootName,
      "faview-mode": FaviewMode.ShowFaviewAndReadme.toString()
    };
    let name = "",
      type = "",
      data: string[] = [],
      first = true,
      value: string;
    for (const line of lines) {
      if (line === "") {
        continue;
      }
      if (line.length > 2 && line.substring(0, 2) === "//") {
        if (first) {
          jb.root.text = setting["root-name"];
          first = false;
        } else {
          jb.add(name, type, data.join("\n"));
        }
        name = line.substring(2);
        if (name.indexOf("~") !== -1) {
          data = name.split("~");
          name = data[0];
          type = data[1];
        } else {
          type = "item";
        }
        data = [];
        continue;
      }
      if (first) {
        name = line.substring(0, line.indexOf("/"));
        value = JSONBuilder.decodeName(line.substring(name.length + 1));
        if (value) {
          setting[name] = value;
        }
      } else {
        data.push(line);
      }
    }
    if (first) {
      jb.root.text = setting["root-name"];
    } else {
      jb.add(name, type, data.join("\n"));
    }
    let faviewMode: FaviewMode;
    const n = parseInt(setting["faview-mode"], 10);
    switch (n) {
      case FaviewMode.ShowLayerTree:
      case FaviewMode.ShowFaview:
      case FaviewMode.ShowFaviewAndReadme:
        faviewMode = n;
        break;
      default:
        faviewMode = FaviewMode.ShowFaviewAndReadme;
        break;
    }
    return {
      root: jb.json,
      faviewMode: faviewMode
    };
  }
}

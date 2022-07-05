import { INode } from "./FavoriteTree";

export class JSONBuilder {
  private _json: INode[];
  get json(): INode[] {
    return this._json;
  }
  get root(): INode {
    return this._json[0];
  }
  constructor(rootText: string) {
    this._json = [
      {
        id: "root",
        text: rootText,
        type: "root",
        state: {
          opened: true
        },
        children: []
      }
    ];
  }

  public add(name: string, type: string, data?: string): void {
    let j: number;
    let c = this._json;
    const nameParts = name.split("/");
    nameParts.unshift(JSONBuilder.encodeName(this.root.text));
    for (let i = 0; i < nameParts.length; ++i) {
      const partName = JSONBuilder.decodeName(nameParts[i]);
      for (j = 0; j < c.length; ++j) {
        if (c[j].text === partName) {
          if (!c[j].children) {
            c = c[j].children = [];
          } else {
            c = c[j].children as INode[];
          }
          j = -1;
          break;
        }
      }
      if (j !== c.length) {
        continue;
      }
      if (i !== nameParts.length - 1) {
        c.push(JSONBuilder._createNode(partName, "folder"));
        c = c[c.length - 1].children as INode[];
        continue;
      }
      c.push(JSONBuilder._createNode(partName, type, data));
    }
  }

  private static _createNode(text: string, type: string, data?: string): INode {
    switch (type) {
      case "item":
        return {
          text: text,
          type: type,
          data: {
            value: data ? data : ""
          },
          children: []
        };
      case "folder":
        return {
          text: text,
          type: type,
          state: {
            opened: true
          },
          children: []
        };
      case "filter":
        return {
          text: text,
          type: type,
          data: {
            value: data ? data : ""
          },
          state: {
            opened: true
          },
          children: []
        };
    }
    throw new Error("unknown node type: " + type);
  }

  public static encodeName(s: string): string {
    return s.replace(
      /[\x00-\x1f\x22\x25\x27\x2f\x5c\x7e\x7f]/g,
      (m) => "%" + ("0" + m[0].charCodeAt(0).toString(16)).slice(-2)
    );
  }

  public static decodeName(s: string): string {
    return decodeURIComponent(s);
  }
}

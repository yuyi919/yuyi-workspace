export class SnippetString {
  static isSnippetString(thing: any): thing is SnippetString {
    if (thing instanceof SnippetString) {
      return true;
    }
    if (!thing) {
      return false;
    }
    return typeof (<SnippetString>thing).value === "string";
  }

  private static _escape(value: string): string {
    return value.replace(/\$|}|\\/g, "\\$&");
  }

  private _tabstop: number = 1;

  value: string;

  constructor(value?: string) {
    this.value = value || "";
  }

  appendText(string: string): SnippetString {
    this.value += SnippetString._escape(string);
    return this;
  }

  appendTabstop(number: number = this._tabstop++): SnippetString {
    this.value += "$";
    this.value += number;
    return this;
  }

  appendPlaceholder(
    value: string | ((snippet: SnippetString) => any),
    number: number = this._tabstop++
  ): SnippetString {
    if (typeof value === "function") {
      const nested = new SnippetString();
      nested._tabstop = this._tabstop;
      value(nested);
      this._tabstop = nested._tabstop;
      value = nested.value;
    } else {
      value = SnippetString._escape(value);
    }

    this.value += "${";
    this.value += number;
    this.value += ":";
    this.value += value;
    this.value += "}";

    return this;
  }

  appendChoice(values: string[], number: number = this._tabstop++): SnippetString {
    const value = values.map((s) => s.replace(/\$|}|\\|,/g, "\\$&")).join(",");

    this.value += "${";
    this.value += number;
    this.value += "|";
    this.value += value;
    this.value += "|}";

    return this;
  }

  appendVariable(
    name: string,
    defaultValue?: string | ((snippet: SnippetString) => any)
  ): SnippetString {
    if (typeof defaultValue === "function") {
      const nested = new SnippetString();
      nested._tabstop = this._tabstop;
      defaultValue(nested);
      this._tabstop = nested._tabstop;
      defaultValue = nested.value;
    } else if (typeof defaultValue === "string") {
      defaultValue = defaultValue.replace(/\$|}/g, "\\$&");
    }

    this.value += "${";
    this.value += name;
    if (defaultValue) {
      this.value += ":";
      this.value += defaultValue;
    }
    this.value += "}";

    return this;
  }
}

export enum SnippetStringItemKind {
  Text,
  Placeholder,
  Choice,
  Variable,
  Tabstop,
}
export type SnippetTextItem = {
  kind: SnippetStringItemKind.Text;
  value: string;
};

export type SnippetChoiceItem = {
  kind: SnippetStringItemKind.Choice;
  values: string[];
};

export type SnippetPlaceholderItem = {
  kind: SnippetStringItemKind.Placeholder;
  name: string;
};

export type SnippetVariableItem = {
  kind: SnippetStringItemKind.Variable;
  defaultValue?: string;
  type: string;
};

export type SnippetItem =
  | SnippetTextItem
  | SnippetChoiceItem
  | SnippetPlaceholderItem
  | SnippetVariableItem;

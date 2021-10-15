import { ScriptVM, parse } from "./lib";

export default class StoryScript {
  loader: ScriptVM;

  constructor(private onGlobalChanged?: any) {}

  public load(string: TemplateStringsArray | string) {
    const result = parse(typeof string === "string" ? string : string[0]);
    return (this.loader = new ScriptVM(result, this.onGlobalChanged));
  }

  protected [Symbol.iterator]() {
    return this.loader;
  }
}

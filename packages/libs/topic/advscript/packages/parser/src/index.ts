import { AdvScriptLoader, parse } from "./lib";

export default class StoryScript {
  loader: AdvScriptLoader;

  constructor(private onGlobalChanged?: any) {}

  public load(string: TemplateStringsArray | string) {
    const result = parse(typeof string === "string" ? string : string[0]);
    return (this.loader = new AdvScriptLoader(result, this.onGlobalChanged));
  }

  protected [Symbol.iterator]() {
    return this.loader;
  }
}

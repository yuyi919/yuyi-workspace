import { postConstruct, injectable as Injectable, tagged, multiInject } from "inversify";
import "reflect-metadata";

export const T = {
  Config: Symbol("Config"),
  Plugin: Symbol("Plugin"),
  NamedPlugin: Symbol("NamedPlugin"),
};

@Injectable()
export class Config {
  constructor(@multiInject(T.Plugin) public plugins: any[]) {}

  @postConstruct()
  loaded() {
    console.log(this.plugins.map((o) => (o instanceof Function ? o() : o)));
  }
}

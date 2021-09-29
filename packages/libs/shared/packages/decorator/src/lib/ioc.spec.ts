import { T, Config } from "@yuyi919/shared-decorator/src/lib/ioc";
import {
  inject,
  decorate,
  injectable as Injectable,
  Container,
  tagged,
  multiBindToService,
  postConstruct,
} from "inversify";

export class PluginA {
  prop?: number;
  constructor() {
    console.log("A");
  }
}
decorate(Injectable(), PluginA);

export class PluginB {
  constructor(public a: any) {
    console.log("B");
  }
}
decorate(tagged("tag", "A"), PluginB, 0);
decorate(inject(T.Plugin), PluginB, 0);
decorate(Injectable(), PluginB);

describe("basic", () => {
  it("aaa", () => {
    const container = new Container({ defaultScope: "Request" });
    container.bind(T.Config).to(Config);
    container.bind(T.Plugin).to(PluginA).whenTargetTagged("tag", "A");
    container.bind(T.Plugin).to(PluginB).whenTargetTagged("tag", "B");
    container.bind(T.Plugin).to(PluginA).whenTargetIsDefault();
    container.bind(T.Plugin).to(PluginB).whenTargetIsDefault();
    expect(container.get(T.Config)).toMatchSnapshot();
  });
});

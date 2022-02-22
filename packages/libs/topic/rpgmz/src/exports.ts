import * as helper from "@yuyi919/rpgmz-plugin-transformer";
import * as cls from "class-transformer";
import * as mobx from "mobx";
import "reflect-metadata";
import * as tslib from "tslib";
import { System } from "./lib/System";
// import { createLogger } from "@yuyi919/shared-logger";
System.register("@yuyi919/rpgmz-plugin-transformer", [], () => ({
  execute() {
    return helper;
  }
}));
System.register("class-transformer", [], () => ({
  execute() {
    return cls;
  }
}));
System.register("mobx", [], () => ({
  execute() {
    return mobx;
  }
}));
System.register("tslib", [], () => ({
  execute() {
    return tslib;
  }
}));

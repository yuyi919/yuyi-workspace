export * from "./core";
export * from "./dom";
export * from "./pixi";
export * from "./managers";
export * from "./game";
export * from "./scenes";
export * from "./sprites";
export * from "./windows";
export * as ECS from "./ecs";

export declare class PluginManagerEx {
  static createParameter(currentScript: Document["currentScript"]): void;
  static findPluginName(currentScript: Document["currentScript"]): string;
  static createCommandArgs<Args>(...args: any[]): Args;
  static registerCommand(
    currentScript: Document["currentScript"],
    commandName: string,
    callback: (args: any) => void
  ): void;
  [key: string]: any;
}

export declare const effekseer: any;
export declare const cordova: object;
export declare const chrome: any;
export declare const AudioContext: Constructable<AudioContext>;
export declare const webkitAudioContext: Constructable<AudioContext>;
export declare const mozIndexedDB: IDBFactory;
export declare const webkitIndexedDB: IDBFactory;
export declare const VorbisDecoder: any;
export declare const $plugins: any[];

export { Main } from "./main";

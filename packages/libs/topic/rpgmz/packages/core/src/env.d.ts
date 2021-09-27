declare const cordova: object;
declare const chrome: any;
declare const AudioContext: Constructable<AudioContext>;
declare const webkitAudioContext: Constructable<AudioContext>;
declare const mozIndexedDB: IDBFactory;
declare const webkitIndexedDB: IDBFactory;

declare const VorbisDecoder: any;

declare const effekseer: any;

declare namespace globalThis {
  //@ts-ignore
  export * from ".";
}

interface Window extends Required<import("./modules").Global> {}
namespace NodeJS {
  interface Global extends Required<import("./modules").Global> {}
}

declare const $plugins: typeof import(".").$plugins;
declare const PluginManager: typeof import(".").PluginManager;
declare const PluginManagerEx: typeof import(".").PluginManagerEx;
declare const TouchInput: typeof import(".").TouchInput;

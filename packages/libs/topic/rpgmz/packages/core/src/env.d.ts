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

declare const PIXI: import("pixi.js");

interface Window extends Required<import("./modules").Global> {}
namespace NodeJS {
  interface Global extends Required<import("./modules").Global> {}
}

declare const $plugins: typeof import(".").$plugins;
declare const PluginManager: typeof import(".").PluginManager;
declare const PluginManagerEx: typeof import(".").PluginManagerEx;
declare const TouchInput: typeof import(".").TouchInput;

// prototype extended by rmmz
interface Array<T> {
  clone(): Array<T>;
  contains(element: T): boolean;
  equals(array: Array<T>): boolean;
  remove(element: T): Array<T>;
}
interface Math {
  /**
   * MZ内置方法，生成随机整数
   * @param max - 最大数值
   */
  randomInt(max: number): number;
}
interface Number {
  clamp(min: number, max: number): number;
  mod(n: number): number;
  padZero(length: number): string;
}
interface String {
  contains(string: string): boolean;
  format(...args: any[]): string;
  padZero(length: number): string;
}
interface Constructable<T> {
  new (...args: any[]): T;
}
interface AbstractConstructable<T> {
  prototype: T;
}

interface Document {
  readonly fullScreenElement?: Element | null;
  readonly mozFullScreen?: Element | null;
  readonly webkitFullscreenElement?: Element | null;
  readonly cancelFullScreen?: () => Promise<void>;
  readonly mozCancelFullScreen?: () => Promise<void>;
  readonly webkitCancelFullScreen?: () => Promise<void>;
}

interface HTMLElement {
  readonly requestFullScreen?: () => Promise<void>;
  readonly mozRequestFullScreen?: () => Promise<void>;
  readonly webkitRequestFullScreen?: (flag?: number) => Promise<void>;
}

interface Navigator {
  readonly standalone?: boolean;
}

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
   * @param max
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

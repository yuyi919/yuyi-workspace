import { Howl, HowlCallback, Howler, HowlOptions } from "howler";

let instanceIdCounter = 0;

export function instanceIdStep() {
  return instanceIdCounter++;
}
const instances = new Set<HowlWrap>();
export class HowlWrap extends Howl {
  _ids = new Set<number>();

  // TODO: The Howler API does not provide a public interface to know if
  // the browser audio is locked or not. But it has a private flag.
  // This could potentially break this library if it changes unexpectedly,
  // but there is no proper way to know.
  isLocked: boolean = !(Howler as any)._audioUnlocked;
  constructor(public options: HowlOptions) {
    super({
      ...options,
      onunlock: (id) => {
        options.onunlock?.(id);
        this.isLocked = false;
      }
    });
    console.log("super", this);
    instances.add(this);
  }

  play(id?: string | number) {
    typeof id === "number" && this._ids.add(id);
    if (this.isLocked) {
      this.unlock();
      // console.log("isLocked");
    }
    return super.play(id);
  }
  /**
   * 解锁并清理所有钩子
   */
  unlock() {
    this.isLocked = false;
    (this as any)._onunlock.forEach(({ fn }: { fn: HowlCallback }) => {
      this._ids.forEach((id) => {
        fn(id);
      });
      this.off("unlock", fn);
      //@ts-ignore
      fn();
    });
  }
}
export function getAllHowl() {
  return instances;
}
export function forceUnlock() {
  for (const howl of instances.values()) {
    if (howl.options.onunlock) {
      howl.off("unlock", howl.options.onunlock);
      howl.unlock();
    }
  }
}
export function unlock(howl: HowlWrap) {}

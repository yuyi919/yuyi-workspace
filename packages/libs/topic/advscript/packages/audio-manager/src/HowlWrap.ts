import { Howl, HowlCallback, Howler, HowlOptions } from "howler";
import { WebAudioDataView } from "./WebAudioDataView";

let instanceIdCounter = 0;

export function instanceIdStep() {
  return instanceIdCounter++;
}

const instances = new Set<HowlWrap>();
export type HowlWrapOptions = Omit<HowlOptions, "loop"> & {
  loop?:
    | boolean
    | {
        start: number;
        length: number;
      };
};
export class HowlWrap2 extends Howl {
  constructor(options) {
    super({
      ...options,
      onload(id) {
        options.onload?.call(this, id);
        // console.log(this);
      }
    });
  }
}

export class HowlWrap extends Howl {
  // TODO: The Howler API does not provide a public interface to know if
  // the browser audio is locked or not. But it has a private flag.
  // This could potentially break this library if it changes unexpectedly,
  // but there is no proper way to know.
  isLocked: boolean = !(Howler as any)._audioUnlocked;

  private declare _sounds: {
    _id: number;
    _node: GainNode & { bufferSource: AudioBufferSourceNode };
  }[];
  private declare _sprite: Record<(string & {}) | "__default", [number, number, boolean?]>;
  private declare _duration: number;
  private declare _src: string;

  private declare _getSoundIds: () => number[];

  constructor(public options: HowlWrapOptions) {
    super({
      ...options,
      loop: !!options.loop,
      onunlock: (id) => {
        options.onunlock?.call(this, id);
        this.isLocked = false;
      },
      onload: (id) => {
        if (!instances.has(this)) {
          options.onload?.call(this, id);
          instances.add(this);
          // const loop = this.getLoopSprite();
          // if (loop) {
          //   console.log(instances, this._src, this.state());
          //   this._duration = (loop[0] + loop[1]) / 1000;
          //   this._sprite.__default = loop;
          // }
        }
      },
      // onplay: (id) => {
      //   options.onplay?.call(this, id);
      //   const bufferSource = this._sounds[0]._node.bufferSource;
      //   if (bufferSource) {
      //     const audioBuffer = bufferSource.buffer;
      //     const buffer = audioBuffer.getChannelData(audioBuffer.numberOfChannels - 1);
      //     const view = new WebAudioDataView();
      //     view.readLoopComments(buffer.buffer);
      //     console.log(audioBuffer, buffer.buffer);
      //   }
      // },
      onplay(this: HowlWrap, id) {
        options.onplay?.call(this, id);
        // Howler.ctx.decodeAudioData(audioData);
        // fetch("/test.ogg", {
        //   method: "get",
        //   headers: {}
        // })
        //   .then((res) => res.arrayBuffer())
        //   .then((data) => {
        //     const view = new WebAudioDataView();
        //     view.readLoopComments(data);
        //     console.log(view, Howler.ctx.decodeAudioData(data));
        //   });
        this.setLoop();
        console.log(this, id);
      },
      onseek(this: HowlWrap, id) {
        options.onseek?.call(this, id);
        console.log(this.seek());
        // this.seek();
        this.setLoop();
        console.log(this, id);
      }
    });
    // console.log("new super", Howler);
  }

  setLoop() {
    const loop = this.getLoopSprite();
    if (loop) {
      // console.log( = this._sounds[0]._start = 0, this, id)
      this._duration = (loop[0] + loop[1] + 10) / 1000;
      this._sprite.__default = loop;
      const source = this._sounds[0]._node.bufferSource as AudioBufferSourceNode;
      if (source) {
        source.loopStart = loop[0] / 1000;
        source.loopEnd = this._duration;
        source.loop = true;
      }
    }
  }

  seek(id?: number): number;
  seek(seek: number, id?: number): this;
  seek() {
    const args = arguments;
    let seek: number, id: number;
    // Determine the values based on arguments.
    if (args.length === 0) {
      // We will simply return the current position of the first node.
      if (this._sounds.length) {
        id = this._sounds[0]._id;
      }
    } else if (args.length === 1) {
      // First check if this is an ID, and if not, assume it is a new seek position.
      const ids = this._getSoundIds();
      const index = ids.indexOf(args[0]);
      if (index >= 0) {
        id = parseInt(args[0], 10);
      } else if (this._sounds.length) {
        id = this._sounds[0]._id;
        seek = parseFloat(args[0]);
      }
    } else if (args.length === 2) {
      seek = parseFloat(args[0]);
      id = parseInt(args[1], 10);
    }

    if (typeof seek === "number") {
      if (seek > this._duration) {
        console.log("seek", seek);
        return super.seek(0, id) as this | number;
      }
      return super.seek(seek, id) as this | number;
    }
    return super.seek() as this | number;
  }

  getLoopSprite() {
    const loop = this.options.loop;
    if (loop instanceof Object)
      return [loop.start / 44.1, loop.length / 44.1, true] as [number, number, boolean?];
  }

  unload() {
    super.unload();
    instances.delete(this);
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  play(id?: string | number) {
    if (this.isLocked) {
      //   this.unlock();
      //   console.log("isLocked");
      //   return super.play(id);
      // return this.seek();
    }
    //  else
    // if (typeof id === 'number' && this._getSoundIds().includes(id)) {
    //   return this.seek();
    // }
    console.log("play", id);
    return super.play(id);
  }
  /**
   * 解锁并清理所有钩子
   */
  unlock() {
    this.isLocked = false;
    (this as any)._onunlock.forEach(({ fn }: { fn: HowlCallback }) => {
      this._getSoundIds().forEach((id) => {
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
export function unlock() {}

// new HowlWrap({
//   src: ["/test.ogg"],
//   preload: true,
//   onload() {
//     if (!this._loaded) {
//       console.log(this);
//       this._loaded = true
//     }
//   }
// });

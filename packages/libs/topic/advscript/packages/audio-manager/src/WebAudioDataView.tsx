// const beep = createOrUpdateBleeps(
//   {},
//   {
//     common: {
//       volume: 0.5
//     }
//   },
//   { test: { src: ["/test.ogg"], autoplay: true, preload: true, volume: 0.5 } },
//   {
//     test: {
//       player: "test",
//       category: "background"
//     }
//   }
// );
// beep.test._howl.play();
export class WebAudioDataView {
  sampleRate: number;
  loopStart: number;
  loopLength: number;

  getMeta() {
    const loopStart = this.loopStart / this.sampleRate;
    const loopEnd = loopStart + this.loopLength / this.sampleRate;
    return { loopStart, loopEnd };
  }

  readLoopComments(arrayBuffer: ArrayBufferLike) {
    const view = new DataView(arrayBuffer);
    let index = 0;
    while (index < view.byteLength - 30) {
      if (this.readFourCharacters(view, index) !== "OggS") {
        break;
      }
      index += 26;
      const numSegments = view.getUint8(index++);
      const segments = [];
      for (let i = 0; i < numSegments; i++) {
        segments.push(view.getUint8(index++));
      }
      const packets = [];
      while (segments.length > 0) {
        let packetSize = 0;
        while (segments[0] === 255) {
          packetSize += segments.shift()!;
        }
        if (segments.length > 0) {
          packetSize += segments.shift()!;
        }
        packets.push(packetSize);
      }
      let vorbisHeaderFound = false;
      for (const size of packets) {
        if (this.readFourCharacters(view, index + 1) === "vorb") {
          const headerType = view.getUint8(index);
          if (headerType === 1) {
            this.sampleRate = view.getUint32(index + 12, true);
          } else if (headerType === 3) {
            this.readMetaData(view, index, size);
          }
          vorbisHeaderFound = true;
        }
        index += size;
      }
      if (!vorbisHeaderFound) {
        break;
      }
    }
  }

  readMetaData(view: DataView, index: number, size: number) {
    for (let i = index; i < index + size - 10; i++) {
      if (this.readFourCharacters(view, i) === "LOOP") {
        let text = "";
        while (view.getUint8(i) > 0) {
          text += String.fromCharCode(view.getUint8(i++));
        }
        const LOOPSTART = text.match(/LOOPSTART=([0-9]+)/);
        if (LOOPSTART) {
          this.loopStart = parseInt(LOOPSTART[1]);
        }
        const LOOPLENGTH = text.match(/LOOPLENGTH=([0-9]+)/);
        if (LOOPLENGTH) {
          this.loopLength = parseInt(LOOPLENGTH[1]);
        }
        if (text === "LOOPSTART" || text === "LOOPLENGTH") {
          let text2 = "";
          i += 16;
          while (view.getUint8(i) > 0) {
            text2 += String.fromCharCode(view.getUint8(i++));
          }
          if (text === "LOOPSTART") {
            this.loopStart = parseInt(text2);
          } else {
            this.loopLength = parseInt(text2);
          }
        }
      }
    }
  }

  readFourCharacters(view: DataView, index: number) {
    let string = "";
    if (index <= view.byteLength - 4) {
      for (let i = 0; i < 4; i++) {
        string += String.fromCharCode(view.getUint8(index + i));
      }
    }
    return string;
  }
}

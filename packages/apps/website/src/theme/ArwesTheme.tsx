/* eslint-disable @typescript-eslint/no-use-before-define */
import React from "react";
import { ArwesThemeProvider, ArwesThemeProviderProps } from "@arwes/core";
import { AnimatorGeneralProvider, AnimatorGeneralProviderProps } from "@arwes/animation";
import { BleepsProvider, BleepsProviderProps, useBleepsSetup } from "@arwes/sounds";
import { StylesBaseline, tryAutoPlay, unlock } from "./shared";
import { HowlOptions, Howler, Howl } from "howler";
// import base64 from "../../static/assets/saki-a/10 新道寺コンボ.ogg?url";
const AudioLock = ({ children }) => {
  const setup = useBleepsSetup();
  const [, setAllow] = React.useState(false);
  React.useEffect(() => {
    tryAutoPlay().then((allow) => {
      if (allow) {
        console.log("unlock");
        // eslint-disable-next-line guard-for-in
        for (const key in setup.bleeps) {
          unlock(setup.bleeps[key]._howl);
        }
        setAllow(allow);
        console.log("tryAutoPlay", allow);
      }
    });
    return () => {
      // eslint-disable-next-line guard-for-in
      for (const key in setup.bleeps) {
        setup.bleeps[key]._howl.stop();
      }
    };
  }, []);
  return children;
};
export function ArwesTheme({ children }) {
  return (
    <ArwesThemeProvider themeSettings={themeSettings}>
      <StylesBaseline
        styles={{
          "html, body": { fontFamily: FONT_FAMILY_ROOT },
          "code, pre": { fontFamily: FONT_FAMILY_CODE }
        }}
      />
      <ArwesPreset>
        <AudioLock>{children}</AudioLock>
      </ArwesPreset>
    </ArwesThemeProvider>
  );
}
export function ArwesPreset({ children }) {
  return (
    <BleepsProvider
      settings={{
        audio: audioSettings,
        players: playersSettings,
        bleeps: bleepsSettings
      }}
    >
      <AnimatorGeneralProvider animator={animatorGeneral}>{children}</AnimatorGeneralProvider>
    </BleepsProvider>
  );
}
const FONT_FAMILY_ROOT = '"Titillium Web", sans-serif';
const FONT_FAMILY_CODE = '"Source Code Pro", monospace';

// Theme with default settings.
const themeSettings: ArwesThemeProviderProps["themeSettings"] = {
  palette: {
    text: {
      // link: "string;",
      // linkHover: "MiniScenarioChart;"
    },
    neutral: {
      main: "#18191a"
    }
  }
};

const bsd = (name: string, ext = ".ogg") => "/assets/se/bsd/" + name + ext;
const bsPlus = (name: string, ext = ".ogg") => "/assets/se/bs+/" + name + ext;
const audioSettings: BleepsProviderProps["settings"]["audio"] = {
  common: { volume: 0.5, preload: true },
  categories: {
    background: { volume: 1, preload: true },
    interaction: { volume: 0.2, preload: true },
    transition: { volume: 1, preload: true },
    notification: { volume: 1, preload: true }
  }
};

class WebAudioDataView {
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

const playersSettings: BleepsProviderProps["settings"]["players"] = {
  type: { src: [bsd("DiveText")], loop: true },
  type2: { src: [bsd("ExitMessage")], loop: true },
  cursor: {
    src: [bsPlus("systemse_cursor"), bsd("SystemSE_Cursor")]
  },
  click: {
    src: [bsPlus("systemse_select"), bsd("SystemSE_Select")]
  },
  cancel: {
    src: [bsd("SystemSE_Cancel")]
  },
  ZoomOut: {
    src: [bsd("SystemSE_ZoomOut"), bsd("CustomSelect"), bsd("SetupMenuComplete")]
  },
  ZoomIn: {
    src: [bsd("SystemSE_ZoomIn")]
  },
  GetItemComplete: {
    src: [bsd("GetItemComplete")]
  },
  GetItemOpen: {
    src: [bsd("GetItemOpen")]
  },
  MainMenu: {
    src: [
      "/assets/saki-a/10 新道寺コンボ.ogg"
      // bsPlus("systemse_mainmenu")
    ],
    loop: true,
    // sprite: {
    //   __default: [0, (544924 + 4217949) / 44.1, true]
    // },
    onplay(id) {
      fetch("/assets/saki-a/10 新道寺コンボ.ogg", {
        method: "get",
        headers: {
          range: "bytes=0-255"
        }
      })
        .then((res) => res.arrayBuffer())
        .then((data) => {
          const view = new WebAudioDataView();
          view.readLoopComments(data);
          console.log(view);
        });
      const source = this._sounds[0]._node.bufferSource as AudioBufferSourceNode;
      if (source) {
        // console.log( = this._sounds[0]._start = 0, this, id)
        source.loopStart = 544924 / 44.1 / 1000;
        source.loopEnd = (544924 + 4217949) / 44.1 / 1000;
        source.loop = true;
        console.log(this, id);
      }
    },
    onseek(this: Howl, id) {
      console.log(this.seek());
      const source = this._sounds[0]._node.bufferSource as AudioBufferSourceNode;
      if (source) {
        // console.log( = this._sounds[0]._start = 0, this, id)
        source.loopStart = 544924 / 44.1 / 1000;
        source.loopEnd = (544924 + 4217949) / 44.1 / 1000;
        source.loop = true;
        console.log(this, id);
      }
      // this.seek();
    }
    // onload(id) {
    //   console.log(this)
    //   debugger
    // },
    // onend(id) {
    //   // console.log(this.play("default"), id);
    // }
  },
  Menu: {
    src: [bsPlus("systemse_menu")]
  },
  Start: {
    src: [bsd("SystemSE_Start")]
  }
};
const animatorGeneral: AnimatorGeneralProviderProps["animator"] = {
  duration: { enter: 500, exit: 200 }
};

export enum SoundType {
  type = "type",
  object = "object",
  readout = "readout",
  click = "click",
  assemble = "assemble",
  type2 = 1,
  cursor,
  cancel,
  GetItemOpen,
  GetItemComplete,
  Menu,
  MainMenu,
  ZoomIn,
  ZoomOut,
  Start
}

const bleepsSettings: BleepsProviderProps["settings"]["bleeps"] = {
  [SoundType.type]: { player: "type" },
  [SoundType.click]: { player: "click", category: "interaction" },
  [SoundType.assemble]: { player: "GetItemOpen", category: "interaction" },
  [SoundType.readout]: { player: "ZoomIn", category: "interaction" },
  [SoundType.object]: { player: "GetItemOpen" },

  [SoundType.type2]: { player: "type2" },
  [SoundType.GetItemOpen]: { player: "GetItemOpen" },
  [SoundType.GetItemComplete]: { player: "GetItemComplete" },
  [SoundType.ZoomIn]: { player: "ZoomIn" },
  [SoundType.ZoomOut]: { player: "ZoomOut" },
  [SoundType.cancel]: { player: "cancel", category: "interaction" },
  [SoundType.cursor]: { player: "cursor", category: "interaction" },
  [SoundType.Menu]: { player: "Menu", category: "interaction" },
  [SoundType.MainMenu]: { player: "MainMenu", category: "interaction" },
  [SoundType.Start]: { player: "Start", category: "notification" }
};

const voice = new Howl({
  src: ["/assets/saki-a/10 新道寺コンボ.ogg"],
  preload: true
});
voice.on("load", () => {
  console.log("voice", voice);
});

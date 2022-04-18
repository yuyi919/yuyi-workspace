/* eslint-disable @typescript-eslint/no-use-before-define */
import React from "react";
import { ArwesThemeProvider, ArwesThemeProviderProps } from "@arwes/core";
import { AnimatorGeneralProvider, AnimatorGeneralProviderProps } from "@arwes/animation";
import { BleepsProvider, BleepsProviderProps, useBleepsSetup } from "@arwes/sounds";
import { StylesBaseline, tryAutoPlay, unlock } from "./shared";
import { HowlOptions, Howler } from "howler";
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
    src: [bsPlus("systemse_mainmenu")]
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

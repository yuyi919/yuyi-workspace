import React, { ReactNode, ReactElement, useContext, useState, useMemo } from "react";

import type {
  BleepsAudioSettings,
  BleepsPlayersSettings,
  BleepsSettings,
  BleepCategoryName,
  BleepsGenerics,
  BleepsSetup
} from "../types";
import { BLEEPS_CATEGORIES } from "../constants";
import { BleepsContext } from "../BleepsContext";
import { createOrUpdateBleeps } from "../utils/createOrUpdateBleeps";
import { debounce } from "lodash";
import immer from "immer";

interface Settings {
  audio?: BleepsAudioSettings;
  players?: BleepsPlayersSettings;
  bleeps?: BleepsSettings;
}

interface BleepsProviderProps {
  settings: Settings;
  children: ReactNode;
}

const BleepsProvider = (props: BleepsProviderProps): ReactElement => {
  const [settings, updateSettings] = React.useState<Settings>(props.settings);
  React.useEffect(() => {
    updateSettings(props.settings);
  }, [props.settings]);
  const parentSetup = useContext(BleepsContext);

  // The bleeps object reference is always kept to properly unload/remove/update
  // current playing bleeps before settings updates.
  // Also, bleeps can not be extended in multiple providers to independently
  // manage them by each provider in the tree.
  const [bleepsGenerics] = useState<BleepsGenerics>({});
  const actions = React.useMemo(
    () => ({
      updateVolume: debounce((volume: number, ca?: BleepCategoryName) => {
        updateSettings((settings) => {
          // console.log("updateSettings");
          return immer(settings, ({ audio }) => {
            (ca ? audio.categories[ca] : audio.common).volume = volume;
          });
        });
      }, 5)
    }),
    []
  );
  const bleepsSetup: BleepsSetup = useMemo(() => {
    const parentSetupSettings = parentSetup?.settings;
    const parentAudioCategories = parentSetupSettings?.audio.categories;
    const localAudioCategories = settings?.audio?.categories;
    const audioCategories = { ...parentAudioCategories };

    if (localAudioCategories) {
      Object.keys(localAudioCategories).forEach((key) => {
        const categoryName = key as BleepCategoryName;

        if (process.env.NODE_ENV !== "production" && !BLEEPS_CATEGORIES.includes(categoryName)) {
          throw new Error(`Bleep category "${categoryName}" is not valid.`);
        }

        audioCategories[categoryName] = {
          ...audioCategories[categoryName],
          ...localAudioCategories?.[categoryName]
        };
      });
    }

    const audioSettings: BleepsAudioSettings = {
      common: {
        ...parentSetupSettings?.audio.common,
        ...settings.audio?.common
      },
      categories: audioCategories
    };

    const parentPlayersSettings = parentSetupSettings?.players;
    const playersSettings: BleepsPlayersSettings = { ...parentPlayersSettings };

    if (settings.players) {
      Object.keys(settings.players).forEach((playerName) => {
        playersSettings[playerName] = {
          ...playersSettings[playerName],
          ...settings.players?.[playerName]
        };
      });
    }

    const parentBleepsSettings = parentSetupSettings?.bleeps;
    const bleepsSettings: BleepsSettings = {
      ...parentBleepsSettings,
      ...settings.bleeps
    };

    createOrUpdateBleeps(bleepsGenerics, audioSettings, playersSettings, bleepsSettings);
    console.log("createOrUpdateBleeps", settings, bleepsGenerics);
    return {
      settings: {
        audio: audioSettings,
        players: playersSettings,
        bleeps: bleepsSettings
      },
      bleeps: bleepsGenerics,
      actions
    };
  }, [settings, parentSetup]);
  // React.useEffect(() => {
  //   console.log("update");
  // }, [bleepsSetup]);
  // TODO: Review performance recommendations for the memo dependencies.
  return <BleepsContext.Provider value={bleepsSetup}>{props.children}</BleepsContext.Provider>;
};

export type { BleepsProviderProps, Settings };
export { BleepsProvider };

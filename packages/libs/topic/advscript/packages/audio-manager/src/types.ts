import { HowlOptions } from "howler";

import {
  BLEEPS_BACKGROUND,
  BLEEPS_TRANSITION,
  BLEEPS_INTERACTION,
  BLEEPS_NOTIFICATION
} from "./constants";
import { HowlWrap } from "./HowlWrap";

// Bleeps Audio Settings

export interface BleepsAudioGroupSettings extends Partial<HowlOptions> {
  volume?: number;
  rate?: number;
  disabled?: boolean;
}

export type BleepCategoryName =
  | typeof BLEEPS_BACKGROUND
  | typeof BLEEPS_TRANSITION
  | typeof BLEEPS_INTERACTION
  | typeof BLEEPS_NOTIFICATION;

export type BleepsAudioCategoriesSettings = Partial<
  Record<BleepCategoryName, BleepsAudioGroupSettings>
>;

export interface BleepsAudioSettings {
  common?: BleepsAudioGroupSettings;
  categories?: BleepsAudioCategoriesSettings;
}

// Bleeps Players Settings

export type BleepPlayerName = string;

export interface BleepPlayerSettings extends Partial<HowlOptions> {
  src: string[];
  loop?: boolean;
  rate?: number;
  disabled?: boolean;
}

export type BleepsPlayersSettings = Record<BleepPlayerName, BleepPlayerSettings>;

// Bleeps Settings

// TODO: There should be a way to define a set of predefined bleeps names, based
// on the bleeps settings provided to the <BleepsProvider />.
export type BleepName = string;

export interface BleepSettings {
  player: BleepPlayerName;
  category?: BleepCategoryName;
}

export type BleepsSettings = Record<BleepName, BleepSettings | undefined>;

// Bleeps Generics
// The generic bleeps interfaces are the bleeps references provided globally
// to components. It would require to explicitely define the "instanceId"
// or an identifier of the location it is being used. For example,
// if three components use the bleeps, each of them has to provide an
// identifier to known where are the calls coming from.

export type BleepGenericInstanceId = number | string;

export interface BleepGeneric {
  play: (instanceId: BleepGenericInstanceId) => void;
  stop: (instanceId: BleepGenericInstanceId) => void;
  getIsPlaying: () => boolean;
  getDuration: () => number;
  unload: () => void;

  _settings: BleepsAudioGroupSettings & BleepPlayerSettings;
  _howl: HowlWrap;
}

export type BleepsGenerics = Record<BleepName, BleepGeneric>;

// Bleeps
// These are the bleeps which the components would normally use, where the
// identification was automatically generated and there is no need
// to explicitely provide it.

export interface Bleep extends BleepGeneric {
  play: () => void;
  stop: () => void;
}

export type Bleeps = Record<BleepName, Bleep>;

// Bleeps Provider/Setup

export interface BleepsSetup {
  settings: {
    audio: BleepsAudioSettings;
    players: BleepsPlayersSettings;
    bleeps: BleepsSettings;
  };
  bleeps: BleepsGenerics;
  actions: {
    updateVolume(value: number, ca?: BleepCategoryName): void;
  };
}

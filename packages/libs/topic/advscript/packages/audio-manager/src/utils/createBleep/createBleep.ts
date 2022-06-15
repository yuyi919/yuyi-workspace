import { Howler } from "howler";
import { HowlWrap } from "../../HowlWrap";

import type {
  BleepsAudioGroupSettings,
  BleepPlayerSettings,
  BleepGenericInstanceId,
  BleepGeneric
} from "../../types";
import { tryAutoPlay } from "../Beeps";
import { mergePercent } from "../mergePercent";

const createBleep = (
  audioSettings: BleepsAudioGroupSettings,
  playerSettings: BleepPlayerSettings
): BleepGeneric => {
  const { disabled, ...settings } = {
    ...audioSettings,
    ...playerSettings,
    volume: mergePercent(audioSettings.volume, playerSettings.volume),
    rate: mergePercent(audioSettings.rate, playerSettings.rate)
  };

  let lastId: number | undefined;
  const howl = new HowlWrap(settings);
  tryAutoPlay().then((unlock) => {
    if (unlock) {
      // console.log("autoplay")
      howl.unlock();
    }
  });

  // In a loop sound, if the sound is played by multiple sources
  // (e.g. multiple components multiple times), to stop the sound,
  // all of the play() calls must also call stop().
  // Otherwise, a race-condition issue can happen.
  const sourcesAccount: Record<BleepGenericInstanceId, boolean> = {};

  const play = (instanceId: BleepGenericInstanceId): void => {
    // Even if the audio is set up to be preloaded, sometimes the file
    // is not loaded, probably because the browser has locked the playback.
    if (howl.state() === "unloaded") {
      // console.log("load")
      howl.load();
    }
    // console.log("play");

    sourcesAccount[instanceId] = true;

    // If the sound is being loaded, the play action will be
    // queued until it is loaded.
    const newId = howl.play(lastId);

    // If the sound is being loaded, it returns null.
    // To prevent errors, the id to pass to play must be a number or undefined.
    lastId = newId || undefined;
  };

  const stop = (instanceId: BleepGenericInstanceId): void => {
    delete sourcesAccount[instanceId]; // eslint-disable-line @typescript-eslint/no-dynamic-delete

    const noActiveSources = !Object.keys(sourcesAccount).length;

    const canStop = settings.loop ? noActiveSources : true;

    if (canStop && howl.playing()) {
      howl.stop();
    }
  };

  const getIsPlaying = (): boolean => {
    return howl.playing();
  };

  const getDuration = (): number => {
    return howl.duration();
  };

  const unload = (): void => {
    howl.unload();
  };

  return {
    _settings: settings,
    _howl: howl,
    play,
    stop,
    getIsPlaying,
    getDuration,
    unload
  };
};

export { createBleep };

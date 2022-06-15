import { useMemo } from "react";
import { instanceIdStep } from "../HowlWrap";

import type { BleepName, Bleep, Bleeps } from "../types";
import { useBleepsSetup } from "../useBleepsSetup";

function useBleeps(): Bleeps {
  interface BleepItem {
    name: BleepName;
    bleep: Bleep;
  }

  const bleepsSetup = useBleepsSetup();

  const instanceId = useMemo(instanceIdStep, []);

  const bleeps: Bleeps = useMemo(() => {
    if (!bleepsSetup) {
      return {};
    }

    return Object.keys(bleepsSetup.bleeps)
      .map((bleepName) => {
        const bleepGeneric = bleepsSetup.bleeps[bleepName];
        let playingOrPrepare = false;
        const bleepItem: BleepItem = {
          name: bleepName,
          bleep: {
            ...bleepGeneric,
            play: () => {
              if (!bleepGeneric.getIsPlaying() && !playingOrPrepare) {
                playingOrPrepare = true;
                return bleepGeneric.play(instanceId);
              }
            },
            stop: () => {
              playingOrPrepare = false;
              bleepGeneric.stop(instanceId);
            }
          }
        };

        return bleepItem;
      })
      .reduce((bleeps: Bleeps, bleepItem: BleepItem) => {
        const { name, bleep } = bleepItem;
        return { ...bleeps, [name]: bleep };
      }, {});
  }, [bleepsSetup]);

  return bleeps;
}

export { useBleeps };

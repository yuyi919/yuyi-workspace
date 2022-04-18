/* eslint-disable @typescript-eslint/no-use-before-define */
import React from "react";
import { BleepsProvider, Settings } from "./BleepsProvider";
import immer from "immer";
import { useBleepsSetup } from "./useBleepsSetup";
import { useBleeps } from "./useBleeps";
import { Bleep, BleepCategoryName } from "./types";
import { debounce } from "lodash";
import { HowlWrap } from "./HowlWrap";

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
export const container = document.createElement("div");
document.body.appendChild(container);
const Manager: React.FC<{ children: any }> = React.memo(({ children }) => {
  const [settings] = React.useState<Settings>(() => ({
    bleeps: {
      test: {
        player: "test",
        category: "background"
      }
    },
    audio: {
      common: {
        volume: 0.5
      },
      categories: {
        background: {
          volume: 0.5
        }
      }
    },
    players: {
      test: {
        html5: true,
        src: ["/test.ogg"],
        preload: true,
        volume: 0.5,
        onplay() {
          // console.log("onplay", this);
        }
      }
    }
  }));
  return <BleepsProvider settings={settings}>{children}</BleepsProvider>;
});

// const Param: React.FC<{
//   value?: number;
//   onChange?(value: number): any;
// }> = (props) => {
//   return (
//     <ParamRange
//       value={settings.audio.categories.background.volume}
//       onChange={(value) => updateVolume(value, "background")}
//     />
//   );
// };

const ParamRange: React.FC<{
  value?: number;
  onChange?(value: number): any;
}> = (props) => {
  const [value, update] = React.useState(props.value);
  const handleChange = React.useCallback(
    (e) => {
      const value = parseFloat(e.target.value);
      update(value);
      props.onChange(value);
    },
    [props.onChange]
  );
  React.useEffect(() => {
    update(props.value);
  }, [props.value]);
  return <input type="range" min={0} max={1} step="any" value={value} onChange={handleChange} />;
};

export const Voice = () => {
  const { test } = useBleeps();
  React.useEffect(() => {
    test.play();
  }, [test]);
  return (
    <div>
      <Progress player={test} />
      <button
        onClick={() => {
          test.play();
        }}
      >
        play
      </button>
    </div>
  );
};
const Progress: React.FC<{ player: Bleep }> = ({ player }) => {
  const [progress, setProgress] = React.useState(player._howl.seek());
  const [duration, setDuration] = React.useState(() => player.getDuration());
  React.useEffect(() => {
    player._howl.on("load", () => {
      setDuration(player.getDuration());
    });
    let id: number;
    function update() {
      setProgress(player._howl.seek());
      id = requestAnimationFrame(update);
    }
    id = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(id);
    };
  }, [player]);
  return (
    <input
      type="range"
      min={0}
      max={duration}
      step="any"
      value={progress}
      onChange={(e) => {
        setProgress(parseFloat(e.target.value));
        player._howl.seek(parseFloat(e.target.value));
      }}
    />
  );
};

const ControlPanel = () => {
  const { settings, actions } = useBleepsSetup();
  return (
    <>
      <ParamRange value={settings.audio.common.volume} onChange={actions.updateVolume} />
      <ParamRange
        value={settings.audio.categories.background.volume}
        onChange={(value) => actions.updateVolume(value, "background")}
      />
    </>
  );
};

export const App = () => {
  return (
    <React.StrictMode>
      <Manager>
        <Voice />
        <ControlPanel />
      </Manager>
    </React.StrictMode>
  );
};

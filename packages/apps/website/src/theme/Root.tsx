import React from "react";
import ReactDOM from "react-dom";
import { ArwesTheme, SoundType } from "./ArwesTheme";
import { WebsiteProvider } from "./WebsiteProvider";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useIsBrowser from "@docusaurus/useIsBrowser";
import { useLocation, useHistory } from "@docusaurus/router";
import { tryAutoPlay } from "./shared";
import { MessageHub, AddFunction } from "./shared/components";
import { useBleeps } from "@arwes/sounds";

const websiteContext = { prevPageType: "", notify() {} };
function createWebsiteContext(arg): any {
  return Object.assign(websiteContext, arg);
}

function useMessageHub() {
  const ref = React.useRef<null | AddFunction>(null);
  const [container, setContainer] = React.useState<HTMLDivElement>();
  const bleeps = useBleeps();
  const handle = React.useCallback(
    (msg: string) => {
      console.log("notify", msg);
      ref.current?.(msg);
      bleeps[SoundType.Start]?.play?.();
    },
    [bleeps]
  );
  const children = React.useCallback((add: AddFunction) => {
    ref.current = add;
  }, []);
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const container = document.createElement("div");
      setContainer(container);
      document.body.appendChild(container);
      return () => container.remove();
    }
  }, []);
  return [
    container &&
      ReactDOM.createPortal(
        <div>
          <MessageHub children={children} />
        </div>,
        container
      ),
    handle
  ] as const;
}
// Default implementation, that you can customize
export default function Root({ children }) {
  // console.log(children);
  const isBrowser = useIsBrowser();
  const baseUrl = useBaseUrl("/");
  const history = useHistory();
  console.debug("useIsBrowser", isBrowser);
  const [portal, handle] = useMessageHub();
  const websiteContext = React.useMemo(() => createWebsiteContext({ notify: handle }), [handle]);
  React.useEffect(() => {
    setTimeout(() => {
      match(history.location);
    }, 20);
    console.debug("mount Root", history.location, isBrowser);
    // if (isBrowser) {
    const destory = history.listen((location) => {
      console.log("websiteContext", { ...websiteContext });
      console.debug("history listen", location, isBrowser);
      setTimeout(() => {
        match(location);
      }, 20);
    });
    // }
    return () => {
      destory();
      console.debug("unmount Root");
    };
  }, []);
  return (
    <>
      <ArwesTheme>
        <WebsiteProvider value={websiteContext}>
          {children}
          {portal}
        </WebsiteProvider>
      </ArwesTheme>
      <svg style={{ display: "none" }}>
        <defs>
          <filter id="noise-link">
            <feTurbulence
              id="animation"
              type="fractalNoise"
              baseFrequency="0.00001 9.9999999"
              numOctaves="1"
              result="warp"
            >
              <animate
                attributeName="baseFrequency"
                from="0.00001 9.9999"
                to="0.00001 0.001"
                dur="2s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feOffset dx="-90" dy="-90" result="warpOffset"></feOffset>
            <feDisplacementMap
              xChannelSelector="R"
              yChannelSelector="G"
              scale="5"
              in="SourceGraphic"
              in2="warpOffset"
            ></feDisplacementMap>
          </filter>
        </defs>
      </svg>
    </>
  );

  function match(location) {
    if (new RegExp("^" + (baseUrl ?? "") + "blog(/|$)").test(location.pathname)) {
      websiteContext.prevPageType = "blog";
    } else {
      websiteContext.prevPageType = "other";
    }
  }
}

// 音乐播放
// function autoPlayMusic() {
//   // 自动播放音乐效果，解决浏览器或者APP自动播放问题
//   function musicInBrowserHandler() {
//     musicPlay(true);
//     document.body.removeEventListener("touchstart", musicInBrowserHandler);
//   }
//   document.body.addEventListener("touchstart", musicInBrowserHandler);

//   // 自动播放音乐效果，解决微信自动播放问题
//   function musicInWeixinHandler() {
//     musicPlay(true);
//     document.addEventListener(
//       "WeixinJSBridgeReady",
//       function () {
//         musicPlay(true);
//       },
//       false
//     );
//     document.removeEventListener("DOMContentLoaded", musicInWeixinHandler);
//   }
//   document.addEventListener("DOMContentLoaded", musicInWeixinHandler);
// }
// function musicPlay(isPlay) {
//   var media = document.querySelector("#bg-music") as HTMLAudioElement;
//   if (isPlay && media.paused) {
//     media.play();
//     console.log("play");
//   }
//   if (!isPlay && !media.paused) {
//     media.pause();
//     console.log("pause");
//   }
// }
// autoPlayMusic();

import { autoSizer, createUseClasses, fade, styled } from "@antv-plus2/theme";
import { IScrollBarProps } from "./ScrollBarProps";
import { BAR_MAP } from "./util";

const fixSize = (props: IScrollBarProps) => props.thumbSize;
const fixSizePlus2 = (props: IScrollBarProps) => props.thumbSize! + 2;

const [classes, useClasses] = createUseClasses("scroll-container", {
  wrap: "wrap",
  view: "view",
  wrapHidden: ["wrap", "hidden-default"],
  wrapNoPadding: ["wrap", "no-padding"],
  native: "native",
  [BAR_MAP.vertical.key]: ["wrap", "has-" + BAR_MAP.vertical.key],
  [BAR_MAP.horizontal.key]: ["wrap", "has-" + BAR_MAP.horizontal.key]
} as const);

const [barClasses, useBarClasses] = createUseClasses("scrollbar", {
  [BAR_MAP.vertical.key]: BAR_MAP.vertical.key,
  [BAR_MAP.horizontal.key]: BAR_MAP.horizontal.key,
  active: "active",
  thumb: "thumb"
} as const);

const nativeScrollbarThumbSizeMixins = (size: number) => {
  const $size = autoSizer(size);
  return styled.createMixin`
    &:horizontal {
      border-top: ${$size} solid transparent;
      border-bottom: ${$size} solid transparent;
    }
    &:vertical {
      border-left: ${$size} solid transparent;
      border-right: ${$size} solid transparent;
    }
  `;
};
export const NativeScrollbarMixins = (scrollbarSize: string = "10px", scrollbarColor: string) => {
  const $scrollbarSize = autoSizer(scrollbarSize);
  const $scrollbarColor$10 = fade(scrollbarColor, "10%");
  const $scrollbarColor$20 = fade(scrollbarColor, "20%");
  const $scrollbarColor$50 = fade(scrollbarColor, "50%");
  const $scrollbarColor$100 = fade(scrollbarColor, "100%");
  return styled.createMixin`
    &::-webkit-scrollbar {
      &:single-button {
        cursor: pointer;
      }
      transition: all 1s;
      max-width: ${$scrollbarSize};
      max-height: ${$scrollbarSize};
    }
    &::-webkit-scrollbar-track {
      background-clip: padding-box;
      background: ${$scrollbarColor$10};
      border-radius: 5px;
      border: 0px solid transparent;
      transition: all 1s;
      &:hover {
        transition: all 1s;
        background: ${$scrollbarColor$20};
      }
    }
    &::-webkit-scrollbar-thumb {
      cursor: pointer !important;
      border-radius: 5px;
      background: ${$scrollbarColor$50};
      transition: all 1s;
      background-clip: padding-box;
      ${nativeScrollbarThumbSizeMixins(2)};
      &:hover,
      &:active {
        background: ${$scrollbarColor$100};
        transition: all 1s;
        background-clip: padding-box;
        ${nativeScrollbarThumbSizeMixins(1)};
      }
    }
    &:not(:scroll) {
      scrollbar-width: none;
      &::-webkit-scrollbar {
        /* width: 0;
        height: 0; */
      }
    }
    & {
      scrollbar-color: ${$scrollbarColor$50} ${$scrollbarColor$10};
      scrollbar-width: thin;
      &:hover,
      &:active {
        scrollbar-color: ${$scrollbarColor$100} ${$scrollbarColor$20};
      }
    }
  `;
};

export const useClass = styled.makeUse`
  &${classes.root} {
    overflow: hidden;
    position: relative;
    height: 100%;
    width: 100%;
    max-height: ${(props) => props.maxHeight}px;
    max-width: ${(props) => props.maxWidth}px;

    & > ${classes.wrap} {
      overflow: auto;
      height: 100%;
      overflow-x: hidden;

      ${(props) =>
        props.native &&
        NativeScrollbarMixins(autoSizer(props.thumbSize! + 2)!, "rgb(206, 206, 206)")}

      &${classes.wrapHidden} {
        scrollbar-width: none;
        &::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
      }
    }

    & > ${classes.wrap}:not(${classes.wrapNoPadding}) {
      &${classes.vertical} {
        & > ${classes.view} {
          padding-right: ${fixSizePlus2}px;
        }
      }
      &${classes.horizontal} {
        & > ${classes.view} {
          padding-bottom: ${fixSizePlus2}px;
        }
      }
    }

    &:active,
    &:focus,
    &:hover {
      & > ${barClasses.root} {
        transition: all 340ms ease-out;
        opacity: 1;
      }
    }

    & > ${barClasses.root} {
      position: absolute;
      right: 2px;
      bottom: 2px;
      z-index: 1;
      border-radius: 4px;
      opacity: 0;
      transition: all 120ms ease-out;
      background-color: rgba(144, 147, 153, 0.05);

      &${barClasses.vertical} {
        top: 2px;
        width: ${fixSize}px;
        & > div {
          width: 100%;
        }
      }
      &${barClasses.horizontal} {
        left: 2px;
        height: ${fixSize}px;
        & > div {
          height: 100%;
        }
      }

      & > ${barClasses.thumb} {
        position: relative;
        display: block;
        width: 0;
        height: 0;
        cursor: pointer;
        border-radius: inherit;
        background-color: rgba(144, 147, 153, 0.3);
        transition: background-color 300ms ease-in-out, height 50ms ease-in-out,
          width 50ms ease-in-out
            ${(props) => (props.delay && `, transform ${props.delay}0ms ease-in-out`) || ""};
      }

      &${barClasses.active}, &:hover {
        background-color: rgba(144, 147, 153, 0.1);
        & > ${barClasses.thumb} {
          background-color: rgba(144, 147, 153, 0.5);
        }
      }
    }
  }
`;
// declare module "@antv-plus2/helper" {
//   interface ComponentTheme {
//     "scroll-container": ReturnType<typeof useClasses>;
//     scrollbar: ReturnType<typeof useBarClasses>;
//   }
// }

export { useClasses, useBarClasses };

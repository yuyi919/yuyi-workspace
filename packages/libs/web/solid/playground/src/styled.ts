// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-rest-params */
/* eslint-disable prefer-spread */
import { Properties as CSSProperties } from "csstype";
import { JSX } from "solid-js";
import { css, setup as gooberSetup } from "goober";
import {
  mergeProps,
  splitProps,
  createContext,
  useContext,
  Component,
  createComponent,
  untrack,
} from "solid-js";
import { spread, ssr, ssrSpread, isServer, getHydrationKey } from "solid-js/web";

export interface CSSAttribute extends CSSProperties {
  [key: string]: CSSAttribute | string | number | undefined;
}
export function setup(prefixer: (key: string, value: any) => string): void {
  gooberSetup(null, prefixer);
}
const ThemeContext = createContext();
export function ThemeProvider<
  T extends {
    theme: any;
    children?: any;
  }
>(props: T) {
  return createComponent(ThemeContext.Provider, {
    value: props.theme,
    get children() {
      return props.children;
    },
  });
}
export function useTheme() {
  return useContext(ThemeContext);
}
type Tagged<T> = <P>(
  args_0:
    | string
    | TemplateStringsArray
    | CSSAttribute
    | ((
        props: P &
          T & {
            theme?: any;
            as?: string | number | symbol | undefined;
            className?: any;
            children?: any;
          }
      ) => string | CSSAttribute),
  ...args_1: (
    | string
    | number
    | ((
        props: P &
          T & {
            theme?: any;
            as?: string | number | symbol | undefined;
            className?: any;
            children?: any;
          }
      ) => string | number | CSSAttribute | undefined)
  )[]
) => ((props: P & T) => JSX.Element) & {
  className: (props: P & T) => string;
};
export function styled<T extends keyof JSX.IntrinsicElements>(
  tag: T | ((props: JSX.IntrinsicElements[T]) => JSX.Element)
): Tagged<JSX.IntrinsicElements[T]> {
  const _ctx = this || {};
  return (...args) => {
    const Styled: Component = (props: JSX.IntrinsicElements[T]) => {
      const theme = useContext(ThemeContext);
      const withTheme = mergeProps(props, { theme });
      const clone = mergeProps(withTheme, {
        get className() {
          const pClassName = withTheme.className,
            append = "className" in withTheme && /^go[0-9]+/.test(pClassName);
          // Call `css` with the append flag and pass the props
          const className = css.apply(
            { target: _ctx.target, o: append, p: withTheme, g: _ctx.g },
            args
          );
          return [pClassName, className].filter(Boolean).join(" ");
        },
      });
      const [local, newProps] = splitProps(clone, ["as"]);
      const createTag = local.as || tag;
      let el;
      if (typeof createTag === "function") {
        el = createTag(newProps);
      } else if (isServer) {
        const [local, others] = splitProps(newProps, ["children"]);
        el = ssr(
          [`<${createTag} `, ">", `</${createTag}>`],
          ssrSpread(others),
          local.children || ""
        );
      } else {
        el = document.createElement(createTag);
        spread(el, mergeProps(newProps, { key: getHydrationKey() }));
      }
      return el;
    };
    Styled.className = (props) => {
      return untrack(() => {
        return css.apply({ target: _ctx.target, p: props, g: _ctx.g }, args);
      });
    };
    return Styled;
  };
}
export function createGlobalStyles() {
  const fn = styled.call({ g: 1 } as any, "div").apply(null, arguments);
  return function GlobalStyles(props: any) {
    fn(props);
    return null;
  };
}

export { css, glob, extractCss, keyframes } from "goober";

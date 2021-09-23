// @ts-nocheck
/* eslint-disable prefer-rest-params */
/* eslint-disable prefer-spread */
import { Properties as CSSProperties } from "csstype";
import { JSX } from "solid-js";
import { css, extractCss, setup as gooberSetup } from "goober";
import {
  mergeProps,
  splitProps,
  createContext,
  useContext,
  Component,
  createComponent,
  untrack,
  createEffect,
} from "solid-js";
import {
  runHydrationEvents,
  spread,
  ssr,
  ssrSpread,
  insert,
  template,
  getNextElement,
  ssrHydrationKey,
  escape,
} from "solid-js/web";

const isServer = typeof window === "undefined";
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
export function styled<T extends Record<string, any>>(tag: (props: T) => JSX.Element): Tagged<T>;
export function styled<T extends keyof JSX.IntrinsicElements>(
  tag: T
): Tagged<JSX.IntrinsicElements[T]>;
export function styled<T extends keyof JSX.IntrinsicElements>(
  tag: T | ((props: JSX.IntrinsicElements[T]) => JSX.Element)
): Tagged<JSX.IntrinsicElements[T]> {
  const _ctx = {} as any;
  return (...args) => {
    const Styled: Component = (props: JSX.IntrinsicElements[T]) => {
      // let first: boolean = true;
      const theme = useContext(ThemeContext);
      const withTheme = mergeProps(props, { theme });

      if (!isServer) {
        // _ctx.target = document.head
        // document.head.appendChild(_ctx.target);
      }

      const clone = mergeProps(withTheme, {
        get className() {
          // if (!isServer) {
          //   if (!first) {
          //     // extractCss(_ctx.target);
          //   } else if (first) {
          //     first = false;
          //   }
          // }
          const pClassName = withTheme.className,
            append = "className" in withTheme && /^go[0-9]+/.test(pClassName);
          // console.log(extractCss(_ctx.target));
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
          [`<${createTag}`, " ", ">", `</${createTag}>`],
          ssrHydrationKey(),
          ssrSpread(others, false, true),
          local.children || ""
        );
      } else {
        el = createNodeWithTagName<T>(createTag, newProps);
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

export function renderClass(content) {
  let el: any;
  if (isServer) {
    const [local, others] = splitProps({}, ["children"]);
    el = ssr(
      [`<style`, " ", ">", `</style>`],
      ssrHydrationKey(),
      ssrSpread(others, false, true),
      local.children || ""
    );
  } else {
    const _tmpl$ = template(`<style></style>`);
    el = getNextElement(_tmpl$);
    insert(el, content, undefined, Array.prototype.slice.call(el.childNodes, 0));
    console.log(_tmpl$, el);
  }
  return el;
}
export function createNodeWithTagName<T extends keyof JSX.IntrinsicElements>(
  createTag: any,
  newProps: Pick<
    JSX.IntrinsicElements[T] & { theme: unknown } & { readonly className: string },
    | Exclude<
        keyof JSX.IntrinsicElements[T],
        keyof JSX.IntrinsicElements[T] | "theme" | "className"
      >
    | Exclude<"theme", keyof JSX.IntrinsicElements[T] | "theme" | "className">
    | Exclude<"className", keyof JSX.IntrinsicElements[T] | "theme" | "className">
  >
) {
  const dom = getNextElement(template(`<${createTag}></${createTag}>`));
  spread(dom, newProps, false, true);
  insert(dom, () => newProps.children, void 0, Array.prototype.slice.call(dom.childNodes, 0));
  runHydrationEvents();
  return dom;
}

export function createGlobalStyles() {
  const fn = styled.call({ g: 1 } as any, "div").apply(null, arguments);
  return function GlobalStyles(props: any) {
    fn(props);
    return null;
  };
}

export { css, glob, extractCss, keyframes } from "goober";

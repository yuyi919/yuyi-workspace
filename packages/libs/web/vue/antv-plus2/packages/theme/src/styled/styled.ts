/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-redeclare */
import { computed, ComputedRef, inject } from "vue-demi";
import {
  getFromVueComponent,
  hackFromVueComponent,
  hackRender,
  Mixins,
  VCProps,
  VueComponent2,
} from "@antv-plus2/helper";
import { mergeJsxPropToVNode } from "@yuyi919/vue-jsx-factory";
// import { defaultTo } from "lodash";
import Vue from "vue";
import Styled, { css, injectGlobal, ThemeProvider } from "vue-styled-components";
import type { RenderContext, VueConstructor } from "vue";
import { stubObjectStatic } from "../utils";
import { Theme, ThemeGetter, useTheme } from "./provider";
import { TemplateArgs } from "./types";
import "./vue-styled-components";

// const test = Styled('div', { a: Boolean })`
//   font-size:${props => props.a === 1 ? '12px' : '24px'}
// `
function getInject<C>(
  t: C,
  baseC?: any
): {
  computed: {
    generatedClassName: () => string;
    themes: () => any;
  };
  created?(): void;
  methods: {
    generateAndInjectStyles: (props: any) => string;
  };
  inject: any;
} {
  const computed = getFromVueComponent(t, "computed");
  const { generateAndInjectStyles = undefined } = getFromVueComponent(t, "methods") || {};
  const inject = getFromVueComponent(t, "inject");
  const pre = baseC && getFromVueComponent(baseC, "methods.generateAndInjectStyles");
  // debugger
  // console.log('pppppppppppppppppppp', pre, getFromVueComponent, { ...baseC })
  return {
    computed: {
      ...computed,
      generatedClassName() {
        // @ts-ignore
        return this.generateAndInjectStyles({ ...getPropsFromContext(this), theme: this.theme });
      },
    },
    methods: {
      generateAndInjectStyles: pre
        ? function (props) {
            return pre(props) + " " + generateAndInjectStyles(props);
          }
        : generateAndInjectStyles,
    },
    inject,
  };
}
// console.log(getInject(test))
// export function styled<
//   T extends VueConstructor<Vue>,
//   TProps extends (T extends VueConstructor<{
//     _tsxattrs: TsxComponentAttrs<infer TP, any, any>;
//   } & Vue> ? TP : T)
//   >(component: T): (...text: (TemplateStringsArray | ((props: TProps) => any))[]) => T & { withComponent: <T>(component: T) => T }

// export function styled<
//   T extends VueConstructor<Vue>,
//   TProps extends (T extends VueConstructor<{
//     _tsxattrs: TsxComponentAttrs<infer TP, any, any>;
//   } & Vue> ? TP : unknown),
//   TEvents = {},
//   TScopedSlots = {},
//   TMixedProps = TProps extends unknown ? VCProps<InstanceType<T>> : TProps
// >(component: T): (...text: (TemplateStringsArray | ((props: TMixedProps) => any))[]) => VueConstructor<{
//   _tsxattrs: TsxComponentAttrs<TMixedProps, TEvents, TScopedSlots> & T & { withComponent: <T>(component: T) => T };
// } & Vue> & T;

function getPropsFromContext(this: RenderContext | Vue, context?: RenderContext | Vue) {
  // @ts-ignore
  const {
    $props = {} as any,
    $attrs = {} as any,
    props = $props || ({} as any),
    attrs = $attrs || ({} as any),
  } = (context || this || {}) as any;
  return { ...attrs, ...props };
}

function withComponent<T extends VueConstructor<Vue>, TProps, TEvents = {}, TScopedSlots = {}>(
  component: any,
  styledComp: any,
  debug = false
): VueConstructor<TProps & TEvents & TScopedSlots & Vue> &
  T & {
    withComponent: <T>(component: T) => T;
  } {
  let baseComponent = component;
  const isFunctional = getFromVueComponent(baseComponent, "functional");
  const setup = getFromVueComponent(baseComponent, "setup");
  const { generateAndInjectStyles = undefined } = getFromVueComponent(styledComp, "methods") || {};
  if (isFunctional) {
    const inject = getFromVueComponent(styledComp, "inject");
    baseComponent = Mixins(baseComponent, { inject } as any) as typeof baseComponent;
    hackRender(
      baseComponent,
      (vnodes, context) => {
        const { props = {}, injections: { $theme = stubObjectStatic } = {} } = context || {};
        // TODO 此处会强制覆盖props中的theme，以后优化
        const className = generateAndInjectStyles({ ...props, theme: $theme() });
        const r = mergeJsxPropToVNode(vnodes, "class", className);
        if (debug) {
          console.log("[Debug]", vnodes, r);
        }
        return r;
      },
      true
    );
  } else {
    if (setup) {
      hackFromVueComponent(baseComponent, "setup", function (setup) {
        return function hackStyledSetup(props: any, context: any) {
          const next = setup(props, context);
          const $theme = inject<Function>("$theme", stubObjectStatic) || stubObjectStatic;
          const theme = computed(() => ($theme instanceof Function && $theme()) || {});
          const generatedClassName = computed(() => {
            return generateAndInjectStyles({ theme: theme.value, ...props });
          });
          // console.log('hack setup !!!', theme, theme())
          return {
            ...next,
            theme,
            generatedClassName,
            isSetupStyledComponent: true,
          };
        };
      });
    } else {
      const injectt = getInject(styledComp, component);
      baseComponent = Mixins(injectt as any, baseComponent, {
        computed: {
          // allContext(): any {
          //   return getAllContext(this as any);
          // },
        },
      } as any) as any;
    }
    hackRender(baseComponent, (vnodes, ctx) => {
      return mergeJsxPropToVNode(vnodes, "class", (ctx as any).generatedClassName);
    });
  }

  const comp = baseComponent as any;
  // const comp = Styled((ccc as any).options || ccc, getPropsClass(component))(...text)
  // console.log(getFromVueComponent(baseC, 'name'), render)
  comp.model = getFromVueComponent(component, "model");
  comp.withComponent = withComponent;
  const r: VueConstructor<TProps & TEvents & TScopedSlots & Vue> &
    T & {
      withComponent: <T>(component: T) => T;
    } = {
    mixins: [comp],
    generateAndInjectStyles,
  } as any;
  return r;
}

function useToPrimitive<T>(r: T) {
  const {
    methods: { generateAndInjectStyles } = {} as any,
    generateAndInjectStyles: generate = generateAndInjectStyles,
  } = r as any;
  if (generate) {
    Object.defineProperty(r, Symbol.toPrimitive, {
      // @ts-ignore
      get() {
        return generate;
      },
      configurable: true,
      enumerable: false,
    });
    // console.log(r, 'Symbol.toPrimitive', r + '')
  }
  return r;
}

export type IStyledComponent<
  TProps,
  TEvents,
  TScopedSlots,
  T = VueConstructor<Vue & TProps>
> = VueComponent2<
  TProps,
  TEvents,
  TScopedSlots,
  T & {
    withComponent: <T>(component: T) => T;
  }
>;
// export function styled<
//   TProps extends {},
//   TEvents extends {},
//   TScopedSlots extends {},
//   TType extends typeof Vue
// >(
//   component: VueComponent<TProps, TEvents, TScopedSlots, TType>,
//   debug?: boolean
// ): (
//   ...text: TemplateArgs<TProps>
// ) => TType & IStyledComponent<TProps, TEvents, TScopedSlots, TType> & string;
export function styled<
  Component extends (props: any) => any,
  TProps extends Component extends (props?: infer P) => any ? P : any
>(
  component: Component,
  debug?: boolean
): (
  ...text: TemplateArgs<TProps, Theme>
) => Component &
  IStyledComponent<TProps, {}, {}, VueConstructor<Vue & Component & TProps>> &
  string;
export function styled<
  T extends VueConstructor<Vue>,
  TProps extends InstanceType<T> extends { $props: infer P } ? P : {},
  TEvents = {},
  TScopedSlots = {}
>(
  component: T,
  debug?: boolean
): (
  ...text: TemplateArgs<TProps, Theme>
) => (T extends VueComponent2<any> ? T : IStyledComponent<TProps, TEvents, TScopedSlots, T>) &
  string;
export function styled<
  T extends VueConstructor<Vue>,
  TProps extends T extends VueComponent2<infer TP> ? TP : unknown,
  TEvents = {},
  TScopedSlots = {},
  TMixedProps = TProps extends unknown ? VCProps<InstanceType<T>> : TProps
>(
  component: T,
  debug?: boolean
): (
  ...text: TemplateArgs<TMixedProps, Theme>
) => (T extends VueComponent2<any> ? T : IStyledComponent<TMixedProps, TEvents, TScopedSlots, T>) &
  string;
export function styled<
  T extends VueConstructor<Vue>,
  TProps extends T extends VueConstructor<infer TP & Vue> ? TP : unknown,
  TEvents = {},
  TScopedSlots = {},
  TMixedProps = TProps extends unknown ? VCProps<InstanceType<T>> : TProps
>(component: T, debug = false) {
  return function StyledComponent(
    ...text: TemplateArgs<TMixedProps, Theme>
  ): (T extends VueComponent2<any> ? T : IStyledComponent<TMixedProps, TEvents, TScopedSlots, T>) &
    string {
    const styledComp = Styled.div(...text);
    return useToPrimitive(
      withComponent<T, TMixedProps, TEvents, TScopedSlots>(component, styledComp, debug)
    ) as any;
  };
}

styled.define = function makeUseStyle<TProps extends any>(): {
  css: (...text: TemplateArgs<TProps, Theme>) => {
    (props: TProps): ComputedRef<string>;
  };
} {
  return {
    css: styled.makeUse,
  };
};
function makeUseStyle<TProps extends any>(
  ...text: TemplateArgs<TProps, Theme>
): {
  (props?: TProps, themeGetter?: ThemeGetter): ComputedRef<string>;
} {
  const propsThemeMap = new WeakMap<any, Theme>();
  const styledComp = Styled.div.apply(
    null,
    text.map((item: any) => {
      if (item instanceof Function) {
        return (props: any) => {
          return item(props, propsThemeMap.get(props));
        };
      }
      return item;
    })
  );
  const { generateAndInjectStyles = undefined } = getFromVueComponent(styledComp, "methods") || {};
  function useStyles(props: any = {}, themeGetter?: ThemeGetter) {
    const theme = useTheme(themeGetter);
    const mixedProps = computed(() => {
      // props.theme = defaultTo(props.theme, theme.value);
      return { ...props, theme: props.theme ?? theme.value };
    });
    return computed(() => {
      propsThemeMap.set(props, theme.value);
      return generateAndInjectStyles?.(mixedProps.value, theme.value) || "";
    });
  }
  return useStyles;
}
styled.makeUse = makeUseStyle;
styled.static = function <TProps extends any>(
  ...text: TemplateArgs<TProps, Theme>
): {
  (props?: TProps, themeGetter?: ThemeGetter): string;
} {
  const propsThemeMap = new WeakMap<any, Theme>();
  const styledComp = Styled.div.apply(
    null,
    text.map((item: any) => {
      if (item instanceof Function) {
        return (props: any) => {
          return item(props, propsThemeMap.get(props));
        };
      }
      return item;
    })
  );
  const { generateAndInjectStyles = undefined } = getFromVueComponent(styledComp, "methods") || {};
  return (props?: TProps) => generateAndInjectStyles(props || {});
};

export type PlainTemplateArgs = (string | number | TemplateStringsArray)[];
/**
 * 单独定义styled片段
 * @param css
 */
styled.css = css;

/**
 * 单独定义styled-mixin片段
 * @param css
 */
styled.createMixin = function createMixin<TProps extends any = any>(
  ...args: TemplateArgs<TProps, Theme>
) {
  return (props: TProps, theme?: Theme) => {
    return css(...args).map((item: any) => {
      if (item instanceof Function) {
        return item(props, theme);
      }
      return item;
    });
  };
};
/**
 * 单独定义styled-mixin片段
 * @param css
 */
styled.makeUseGlobal = function createGlobal<TProps extends any = any>(
  ...args: TemplateArgs<TProps, Theme>
) {
  return (props: TProps, theme?: Theme) => {
    const $theme = useTheme(theme);
    return injectGlobal`
      ${styled.createMixin(...args)(props, $theme.value)}
    `;
  };
};

function constansts(
  key: string
): (...text: TemplateArgs<{}, Theme>) => VueComponent2<{}, any, any> {
  const comps = Styled[key];
  return function (...args: any[]) {
    return useToPrimitive(comps(...args));
  } as any;
}

Object.assign(styled, Styled);
styled.div = constansts("div");
styled.span = constansts("span");
styled.a = constansts("a");

export { injectGlobal, css, ThemeProvider };
export type { ComputedRef };

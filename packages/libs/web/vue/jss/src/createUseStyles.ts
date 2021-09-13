import Types from "@yuyi919/shared-types";
import { Classes, GenerateId, StyleSheet } from "jss";
import {
  computed,
  ComputedRef,
  isRef,
  onBeforeUnmount,
  Ref,
  shallowRef,
  watch,
  watchEffect,
} from "vue-demi";
import { injectJssContext } from "./JssContext";
// import type { Styles } from '@material-ui/styles'
import { Styles } from "./styles";
import { Theming, useTheme as useDefaultTheme } from "./theming";
import { DynamicRules } from "./types";
import getSheetClasses from "./utils/getSheetClasses";
import getSheetIndex from "./utils/getSheetIndex";
import { manageSheet, unmanageSheet } from "./utils/managers";
import {
  addDynamicRules,
  createStyleSheet,
  removeDynamicRules,
  updateDynamicRules,
} from "./utils/sheets";

// interface Theming<Theme> {
//   context: React.Context<Theme>
//   withTheme: WithThemeFactory<Theme>
//   ThemeProvider: ThemeProviderFactory<Theme>
//   useTheme: UseThemeFactory<Theme>
// }

export interface StyleSheetFactoryOptions {
  media?: string;
  meta?: string;
  index?: number;
  link?: boolean;
  element?: HTMLStyleElement;
  generateId?: GenerateId;
  classNamePrefix?: string;
}

interface BaseOptions<Theme = DefaultTheme> extends StyleSheetFactoryOptions {
  index?: number;
  theming?: Theming<Theme>;
}

interface CreateUseStylesOptions<Theme = DefaultTheme> extends BaseOptions<Theme> {
  name?: string;
}

export interface DefaultTheme {}

// export function createUseStyles<
//   Theme = DefaultTheme,
//   C extends string = string
// >(
//   styles: Styles<C> | ((theme: Theme) => Styles<C>),
//   options?: CreateUseStylesOptions<Theme>,
// ): (data?: unknown) => Classes<C>

function createUseStyles<Theme = DefaultTheme, C extends string = string>(
  styles: Styles<Theme, Types.IObj, C>,
  options: CreateUseStylesOptions<Theme> = {}
): (data?: unknown) => ComputedRef<Classes<C>> {
  const { index = getSheetIndex(), theming, name, ...sheetOptions } = options;

  const useTheme =
    typeof styles === "function" ? (theming ? theming.useTheme : useDefaultTheme) : useDefaultTheme;

  return function useStyles(data?: any) {
    const theme = useTheme() as Ref<Theme>;

    const context = injectJssContext();

    /**
     * !important
     * 这里必须使用 shallowRef，默认的 `ref.value` 返回的是一个proxy
     * 在存储meta的时候存的是 StyleSheet 对象，但是我们那proxy去取就会导致取不到
     */
    const sheet: Ref<StyleSheet> = shallowRef();
    const dynamicRules: Ref<DynamicRules | null> = shallowRef(null);

    watch(
      [context, theme],
      ([,], [pc, pt]) => {
        const sheetInstance = createStyleSheet({
          context: context.value,
          styles,
          name,
          theme: theme.value,
          index,
          sheetOptions,
        });

        if (sheet.value && sheetInstance !== sheet.value) {
          unmanageSheet({
            index,
            context: pc,
            sheet: sheet.value,
            theme: pt,
          });

          if (sheet.value && dynamicRules.value) {
            removeDynamicRules(sheet.value, dynamicRules.value);
          }
        }

        const dys = sheetInstance
          ? addDynamicRules(sheetInstance, isRef(data) ? data.value : data)
          : null;

        // console.log(dys)

        if (sheetInstance) {
          manageSheet({
            index,
            context: context.value,
            sheet: sheetInstance,
            theme: theme.value,
          });
        }

        sheet.value = sheetInstance;
        dynamicRules.value = dys;
      },
      { immediate: true }
    );

    watchEffect(() => {
      if (sheet.value && dynamicRules.value) {
        updateDynamicRules(isRef(data) ? data.value : data, sheet.value, dynamicRules.value);
      }
    });

    const classes: ComputedRef<Classes> = computed(() => {
      return sheet.value && dynamicRules.value
        ? getSheetClasses(sheet.value, dynamicRules.value!)
        : {};
    });

    onBeforeUnmount(() => {
      if (sheet) {
        unmanageSheet({
          index,
          context: context.value,
          sheet: sheet.value,
          theme: theme.value,
        });
      }

      if (sheet.value && dynamicRules.value) {
        removeDynamicRules(sheet.value, dynamicRules.value);
      }
    });

    return classes;
  };
}

export default createUseStyles;

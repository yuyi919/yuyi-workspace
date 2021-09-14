import Types from "@yuyi919/shared-types";
import { GenerateId, StyleSheet, StyleSheetFactoryOptions } from "jss";
import { isRef } from "vue-demi";
import { Styles } from "./styles";
import { Context as JssContextValue, DynamicRules } from "./types";
import getSheetClasses from "./utils/getSheetClasses";
import { increment } from "./utils/getSheetIndex";
import { manageSheet, unmanageSheet } from "./utils/managers";
import {
  addDynamicRules,
  createStyleSheet,
  removeDynamicRules,
  updateDynamicRules,
} from "./utils/sheets";

export interface DefaultTheme {}

export interface CreateUseStylesHookOptions extends Omit<StyleSheetFactoryOptions, "index"> {
  name?: string;
}

export declare abstract class StyleHooks<Theme, Data, ClassKey extends string> {
  readonly sheet: StyleSheet<string | number | symbol>;
  init: (theme: Theme, context: JssContextValue, nextData?: Data) => void;
  dispose: () => void;
  update: (nextData: Data) => void;
  getClasses: () => {
    [K in ClassKey]: string;
  };
}

export function createUseStylesHooks<
  Theme = DefaultTheme,
  ClassKey extends string = string,
  InheritData = any
>(
  styles: Styles<Theme, Types.IObj, ClassKey>,
  options: CreateUseStylesHookOptions = {},
  keyMap?: Record<string, string>
) {
  const { name, ...sheetOptions } = options;
  const index = increment();
  return <Data extends InheritData>(initialData: Data): StyleHooks<Theme, Data, ClassKey> => {
    let sheet: StyleSheet,
      dynamicRules: DynamicRules | null,
      context: JssContextValue,
      theme: Theme,
      data = initialData;

    function dispose() {
      unmanageSheet({
        index,
        context,
        sheet,
        theme,
      });
      if (sheet && dynamicRules) {
        removeDynamicRules(sheet, dynamicRules);
      }
    }

    function init(theme: Theme, context: JssContextValue, nextData: Data = data) {
      const nextSheet = createStyleSheet({
        context,
        styles,
        name,
        theme,
        index,
        sheetOptions,
      });

      if (sheet && nextSheet !== sheet) {
        dispose();
      }

      dynamicRules = nextSheet ? addDynamicRules(nextSheet, nextData) : null;
      data = nextData;

      // console.log(dys)
      if (nextSheet) {
        manageSheet({
          index,
          context,
          sheet: nextSheet,
          theme,
        });
      }

      sheet = nextSheet;
    }
    function update(nextData: Data) {
      if (nextData !== data && sheet && dynamicRules) {
        updateDynamicRules(isRef(nextData) ? nextData.value : nextData, sheet, dynamicRules);
        data = nextData;
      }
    }
    function getClasses() {
      return (sheet && dynamicRules ? getSheetClasses(sheet, dynamicRules!, keyMap) : {}) as {
        [K in ClassKey]: string;
      };
    }
    return {
      get sheet() {
        return sheet;
      },
      init,
      dispose,
      update,
      getClasses,
    };
  };
}

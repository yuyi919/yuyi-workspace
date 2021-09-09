/**
 * @package Component
 */
/* eslint-disable no-redeclare */
import { Getter } from "./interface";
import type { ThemeProps, Theme } from "../styled/provider";
import {
  prefixCls as _prefixCls,
  borderColorBase as _borderColorBase,
  borderRadiusBase as _borderRadiusBase,
} from "../../exports/component.module.less";

export interface IComponent {
  /**
   * @name @prefix-cls
   */
  prefixCls: string;
  /**
   * @name @border-color-base
   */
  borderColorBase: string;
  /**
   * @name @border-radius-base
   */
  borderRadiusBase: string;
}

/**
 * @name @prefix-cls
 */
export const prefixCls: IComponent["prefixCls"] = _prefixCls;
/**
 * @name @border-color-base
 */
export const borderColorBase: IComponent["borderColorBase"] = _borderColorBase;
/**
 * @name @border-radius-base
 */
export const borderRadiusBase: IComponent["borderRadiusBase"] = _borderRadiusBase;

/**
 * @name 取得变量prefix-cls
 */
export function useComponent(name: "prefixCls"): Getter<IComponent["prefixCls"]>;
/**
 * @name 取得变量border-color-base
 */
export function useComponent(name: "borderColorBase"): Getter<IComponent["borderColorBase"]>;
/**
 * @name 取得变量border-radius-base
 */
export function useComponent(name: "borderRadiusBase"): Getter<IComponent["borderRadiusBase"]>;
export function useComponent<K extends keyof IComponent>(name: K): Getter<IComponent[K]>;
export function useComponent(name: string) {
  return (componentGetter[name as keyof typeof componentGetter] || (() => void 0)) as any;
}
export const componentGetter = Object.freeze({
  prefixCls(props: any, theme?: Theme) {
    return (theme || props.theme)?.component?.prefixCls || component.prefixCls;
  },
  borderColorBase(props: any, theme?: Theme) {
    return (theme || props.theme)?.component?.borderColorBase || component.borderColorBase;
  },
  borderRadiusBase(props: any, theme?: Theme) {
    return (theme || props.theme)?.component?.borderRadiusBase || component.borderRadiusBase;
  },
});

export const component: IComponent = Object.freeze({
  prefixCls,
  borderColorBase,
  borderRadiusBase,
});

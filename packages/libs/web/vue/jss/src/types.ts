/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type {
  Jss,
  SheetsRegistry,
  SheetsManager,
  Rule,
  CreateGenerateIdOptions,
  GenerateId
} from "jss";
// import type {Node} from 'react'
// import type {Theming} from 'theming'

export interface Managers {
  [key: number]: SheetsManager;
}

export interface Context {
  jss?: Jss;
  registry?: SheetsRegistry;
  managers?: Managers;
  id?: CreateGenerateIdOptions;
  classNamePrefix?: string;
  disableStylesGeneration?: boolean;
  media?: string;
  generateId?: GenerateId;
}

interface IClasses {
  [key: string]: string;
}

export type InnerProps = {
  children?: Node;
  classes: IClasses;
};

export type DynamicRules = {
  [key: string]: Rule;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type StaticStyle = {};
export type DynamicStyle<Theme> = (style: { theme: Theme }) => StaticStyle;

export type StaticStyles = { [key: string]: StaticStyle };

export type ThemedStyles<Theme> = (theme: Theme) => StaticStyle | DynamicStyle<Theme>;

export type StyleItems<Theme> = StaticStyles | ThemedStyles<Theme>;

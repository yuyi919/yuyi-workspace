import { ITheme } from "../theme";

export type Getter<T> = (props: any, Theme?: ITheme) => T;

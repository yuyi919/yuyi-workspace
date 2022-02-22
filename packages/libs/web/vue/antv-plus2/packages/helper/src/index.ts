/* eslint-disable @typescript-eslint/ban-types */
import Vue, { VueConstructor } from "vue";
import type { VCProps } from "./prop-util";
import { TsxComponentInstance } from "./TsxTypeInfo";

export type VueConstructorStaticMembers<T extends VueConstructor<any>> = Omit<
  StaticMembers<T>,
  keyof VueConstructor<Vue>
>;

export type StaticMembers<
  T extends {
    new (...args: any[]): any;
  }
> = Omit<T, "prototype" | "constructor">;

export type VueComponent2<
  Props,
  Events = {},
  ScopedSlots = {},
  Publics = {},
  Static extends typeof Vue = typeof Vue
> = VueConstructor<
  TsxComponentInstance<
    InstanceType<Static> & Props & Publics,
    {
      [key: string]: any;
    },
    Props,
    Events,
    ScopedSlots
  >
> & //  & {
//   Type: TsxComponentInstance<
//     Vue & Props & Publics,
//     {
//       props?: Partial<Props>;
//       vModel?: any;
//     },
//     Props,
//     OnEvents<Events> & { [key: string]: any },
//     Events,
//     ScopedSlots
//   >;
// }
{
  [K in keyof VueConstructorStaticMembers<Static>]: Static[K] extends VueConstructor<any>
    ? VueComponent2<VCProps<InstanceType<Static[K]> & Vue, false>, {}, {}, {}, Static[K]>
    : Static[K];
};

export type ResolveSubModule<
  T extends new () => any,
  K extends keyof T
> = T[K] extends new () => infer Cls ? Cls : never;

export * from "./mixins";
export * from "./optionResolver";
export * from "./prop-util";
export * from "./TsxTypeInfo";
export * from "./slot";
export * from "./transition";
export * from "./KeyCode";
import * as DomUtils from "./dom";

import type * as base from "../types/base.d";
import type * as builtin from "../types/builtin-components.d";
import type * as dom from "../types/dom.d";
export type { base, builtin, dom };
export function noop() {}
export { DomUtils };

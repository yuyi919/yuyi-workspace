/* eslint-disable @typescript-eslint/ban-types */
import type { Types, KeyOf, ValueOf } from "@yuyi919/shared-types";

// type EventNames = {
//   "change-value": 1;
//   "change-keys": 2;
// };
// type HandleEventNames = OnEvents<EventNames>;
type ToOnEventName<K extends string> = `on${Types.String.CamelCase<K, "-" | ":", 8>}`;
type ToOnEventNameMap<T extends Record<string, any>> = ValueOf<{
  [K in KeyOf<T>]: {
    SourceKey: K;
    OnName: ToOnEventName<K>;
  };
}>;

export type OnEvents<On> = {
  [K in ToOnEventName<KeyOf<On>>]: KeyOf<On> extends string
    ? On[Extract<ToOnEventNameMap<On>, { SourceKey: any; OnName: K }>["SourceKey"]]
    : never;
};

export interface TsxTypeInfoHook<
  Props extends Record<string, any>,
  Events extends Record<string, any> = Record<string, any>,
  ScopedSlotArgs extends Record<string, any> = Record<string, any>
> {
  props: Props;
  on: EventHandlers<Events>;
  slots: InnerScopedSlots<ScopedSlotArgs>;
}

export interface TsxTypeInfo<
  Props extends Record<string, any>,
  Events extends Record<string, any> = Record<string, any>,
  ScopedSlotArgs extends Record<string, any> = Record<string, any>
> {
  props: Props;
  events: Events;
  onEvents: {
    [K in ToOnEventName<KeyOf<Events>>]: KeyOf<Events> extends string
      ? Events[Extract<ToOnEventNameMap<Events>, { SourceKey: any; OnName: K }>["SourceKey"]]
      : never;
  };
  scopedSlots: InnerScopedSlots<ScopedSlotArgs>;
  attributes: Props & {
    props?: Partial<Props>;
    vModel?: any;
  };
}

export interface TsxTypedComponents<
  Props extends Record<string, any>,
  Events extends Record<string, any> = Record<string, any>
> {
  _tsx: TsxTypeInfo<Props, Events>;
}

export type InnerScopedSlotReturnType = Vue["$scopedSlots"] extends {
  [name: string]: ((...args: any[]) => infer T) | undefined;
}
  ? T
  : never;
export type EventHandler<E> = [E] extends [(...args: any[]) => any] ? E : (payload: E) => any;
export type EventHandlers<E> = { [K in keyof E]?: EventHandler<E[K]> | EventHandler<E[K]>[] };
export type InnerScopedSlot<T> = (props: T) => InnerScopedSlotReturnType;
export type InnerScopedSlots<T> = { [K in keyof T]: InnerScopedSlot<Exclude<T[K], undefined>> };
export type TypeTsxProps<
  Props extends Types.Recordable,
  Events extends Types.Recordable = {},
  ScopedSlots extends Types.Recordable = {},
  Attributes extends Types.Recordable = {}
> = InnerTypeTsxProps<Props, EventHandlers<Events>, ScopedSlots, Attributes>;

// type a = TypeTsxProps<{}, { a: 1 }>["onA"];
// type b = EventHandler<1> | EventHandler<1>[];

type InnerTypeTsxProps<
  Props extends Types.Recordable,
  Events extends Types.Recordable = {},
  ScopedSlots extends Types.Recordable = {},
  Attributes extends Types.Recordable = {}
> = Attributes &
  Props & {
    [K in ToOnEventName<KeyOf<Events>>]?: KeyOf<Events> extends string
      ? Events[Extract<ToOnEventNameMap<Events>, { SourceKey: any; OnName: K }>["SourceKey"]]
      : never;
  } & {
    attrs?: Attributes;
    on?: Events;
    props?: Partial<Props> & { [key: string]: any };
    model?: {
      value?: any;
      callback?: (...args: any) => any;
    };
    vModel?: {
      value?: any;
      callback?: (...args: any) => any;
    };
    scopedSlots?: InnerScopedSlots<ScopedSlots>;
  };
export type TsxComponentInstance<V extends Vue, Attributes, Props, Events, ScopedSlotArgs> = {
  $props: TypeTsxProps<Props, Events, ScopedSlotArgs, Attributes>;
  $scopedSlots: InnerScopedSlots<ScopedSlotArgs>;
  $listeners: Record<keyof Events, any>;
} & V;

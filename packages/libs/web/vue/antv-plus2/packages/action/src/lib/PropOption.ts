/* eslint-disable no-use-before-define */
import { PropsOption as PropValidator } from "./PropsOptionsGroup";
import Vue from "vue";
import { PropType } from "vue-demi";
import { TypedPropsGroup } from "../helper";
const dummyProps = {
  objectProp: Object,
  objectProp2: {
    type: Object,
  },
  booleanProp: Boolean,
  booleanProp2: {
    type: Boolean,
  },
  numberProp: Number,
  numberProp2: {
    type: Number,
  },
  stringProp: String,
  stringProp2: {
    type: String,
  },
  dateProp: Date,
  dateProp2: {
    type: Date,
  },
};
export type DummyPropsType = import("vue-demi").ExtractPropTypes<typeof dummyProps>;
export type DummyPropsType2 = ExtractPropTypes<typeof dummyProps>;

export type DummyType = {
  colorInherit?: boolean;
};
export interface DummyCls {
  colorInherit?: boolean;
}
const dummyProps2 = {
  nullProp: null,
  nullProp2: {
    type: null,
  },
  typeProps: Object as PropType<DummyType>,
  typeProps2: {
    type: Object as PropType<DummyType>,
  },
  classProps: Object as PropType<DummyCls>,
  classProps2: {
    type: Object as PropType<DummyCls>,
  },
  funcProps: Function,
  funcProps2: {
    type: Function,
    required: true,
  },
  typedFuncProps: Function as PropType<() => DummyType>,
  typedFuncProps2: {
    type: Function as PropType<() => DummyType>,
  },
  unionType: [Function, Number] as PropType<DummyCls | number>,
} as const;
export type DummyProps2Type = import("vue-demi").ExtractPropTypes<typeof dummyProps2>;
export type DummyProps2Type2 = ExtractPropTypes<typeof dummyProps2>;

export type DefaultProps = import("vue-demi").ExtractDefaultPropTypes<{
  defaultProps: {
    type: PropType<DummyCls>;
    default: { colorInherit: false };
  };
}>;

export type Prop<T> =
  | { (): T }
  | { new (...args: never[]): T & object }
  | { new (...args: string[]): Function };
export type ExtractPropType<T> = T extends null
  ? any
  : T extends {
      type: null | true;
    }
  ? any
  : T extends { type: ObjectConstructor } | ObjectConstructor
  ? Record<string, any>
  : T extends
      | DateConstructor
      | {
          type: DateConstructor;
        }
  ? Date
  : T extends
      | FunctionConstructor
      | {
          type: FunctionConstructor;
        }
  ? (...args: any[]) => any
  : T extends PropValidator<infer V> | (new (...args: any[]) => infer V)
  ? V
  : never;
export type ExtractPropTypes<
  PropsDef,
  RequiredValidator extends RequiredValidate<
    PropsDef,
    RequiredPropNames<PropsDef>
  > = RequiredValidate<PropsDef, RequiredPropNames<PropsDef>>
> = {
  [K in keyof RequiredValidator]: ExtractPropType<RequiredValidator[K]>;
};

export type ExtractPropTypeGroup<T> = {
  [K in keyof T]: ExtractPropType<T[K]>;
};

export type RequiredValidate<T, RequiredKeys extends keyof T> = Required<Pick<T, RequiredKeys>> &
  Partial<Omit<T, RequiredKeys>>;
// {
//   [K in keyof Pick<T, RequiredKeys>]: T[K];
// } &
//   {
//     [K in keyof Omit<T, RequiredKeys>]?: T[K];
//   };
/**
 * Experimental support for new typings introduced from Vue 2.5
 * Depending on some private types of vue, which may be changed by upgrade :(
 */
export type RequiredPropNames<PropsDef extends TypedPropsGroup<{}>> = {
  [K in keyof PropsDef]: PropsDef[K] extends {
    required?: true;
  }
    ? K
    : PropsDef[K] extends BooleanConstructor | { type: BooleanConstructor }
    ? K
    : never;
}[Extract<keyof PropsDef, string>];

export type PropsForOutside<Props, RequiredPropNames extends keyof Props> = {
  [K in RequiredPropNames]: Props[K];
} & {
  [K in Exclude<keyof Props, RequiredPropNames>]?: Props[K];
};

export type ExtractDefineProps<T extends TypedPropsGroup<any>> = {
  [K in keyof RequiredValidate<T, RequiredPropNames<T>>]: ExtractPropType<
    RequiredValidate<T, RequiredPropNames<T>>[K]
  >;
};

export function defineTypedProps<T extends TypedPropsGroup<any>>(props: T) {
  return Vue.extend({
    props: props as any,
  }) as unknown as {
    [K in keyof RequiredValidate<T, RequiredPropNames<T>>]: ExtractPropType<
      RequiredValidate<T, RequiredPropNames<T>>[K]
    >;
  };
}

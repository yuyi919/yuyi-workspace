/* eslint-disable no-unused-expressions */
import { getProps } from "./shared";
import { getCurrentInstance, SetupContext } from "vue-demi";
import { VNode } from "vue";

export type InheritEventHooks<K extends string> = readonly [
  getInheritEvent: () => {
    [key: string]: (...args: any[]) => void;
  },
  /**
   * 必要的事件句柄
   */
  requiredEventHandle: Record<K, (...args: any[]) => void>
];

export type InheritHooks<K extends string = string> = readonly [
  getInherit: <Props = Record<string, any>>() => {
    scopedSlots: Record<string, (...args: any[]) => VNode[]>;
    /**
     * children
     */
    children: VNode[];
    props: Props;
    /**
     * 继承事件
     */
    on: {
      [key: string]: (...args: any[]) => any;
    };
  },
  /**
   * 必要的事件句柄
   */
  requiredEventHandle: Record<K, (...args: any[]) => any>
];

/**
 * 工具hooks，继承组件时使用
 * 继承事件原理参照 {@link useInheritEvents}
 * @param context （必传）参照setup配置
 * @param usedEvent 过滤事件name数组，从继承事件中排除以手动控制
 * @remark 继承方法 (getChildren, getInheritEvent) 必须在render函数中调用，别放进computed
 * @example
 * defineComponent({
 *  setup(props, context) {
 *    const [
 *      getChildren, // 取得组件children
 *      getInheritEvent, // 取得组件继承事件，除了update事件需要手动传递
 *      { update } // => 取得usedEvent数组指定的事件句柄
 *    ] = useInherit(context, ["update"]) // update可不传
 *    //...
 *    return () => {
 *      return (
 *        <DummyComponent {...{ on: getInheritEvent() }}>
 *          {getChildren()}
 *        </DummyComponent>
 *      )
 *    }
 *  }
 * })
 */
export function useInherit<K extends string = string>(
  context: SetupContext<any>,
  usedEvent?: K[]
): InheritHooks<K> {
  const self = getCurrentInstance().proxy;
  const [getEvent, required] = useInheritEvents(context, usedEvent);
  return [
    () => {
      return {
        get children() {
          return context.slots.default?.();
        },
        get scopedSlots() {
          const { default: children, ...other } = context.slots;
          return other;
        },
        get props() {
          return getProps(self.$props);
        },
        get on() {
          return getEvent();
        },
      };
    },
    required,
  ] as InheritHooks<K>;
}

/**
 * 继承传递组件事件
 * 原理为遍历组件$listeners，将对应key的事件映射为 (...args: any[]) => context.emit(key, ...args)
 * @param context （必传）参照setup配置
 * @param usedEvent 过滤事件name数组，从继承事件中排除以手动控制
 * @remark 继承方法 (getChildren, getInheritEvent) 必须在render函数中调用，别放进computed
 * @example
 * defineComponent({
 *  setup(props, context) {
 *    const [
 *      getInheritEvent, // 取得组件继承事件，除了update事件需要手动传递
 *      { update } // => 取得usedEvent数组指定的事件句柄
 *    ] = useInheritEvents(context, ["update"]) // update可不传
 *    //...
 *    return () => {
 *      return (
 *        <DummyComponent {...{ on: getInheritEvent() }}>
 *          {getChildren()}
 *        </DummyComponent>
 *      )
 *    }
 *  }
 * })
 */
export function useInheritEvents<K extends string = string>(
  context: SetupContext,
  usedEvent?: K[]
): InheritEventHooks<K> {
  const self = getCurrentInstance().proxy;
  const requiredHandle = {} as Record<K, (...args: any[]) => void>;
  const usedKeyMap = {} as Record<K, true>;
  if (usedEvent instanceof Array)
    for (const key of usedEvent) {
      requiredHandle[key] = (...args) => {
        context.emit(key, ...args);
      };
      usedKeyMap[key] = true;
    }

  return [
    () => {
      const pureListeners = self.$listeners;
      const inheritHandle = {};
      for (const key in pureListeners) {
        if (!usedKeyMap[key as K]) {
          inheritHandle[key] = (...args: any[]) => context.emit(key, ...args);
        }
      }
      return inheritHandle as {
        [key: string]: (...args: any[]) => void;
      };
    },
    requiredHandle,
  ];
}

export function useHandle<E extends Event, CallBack extends (e: E, ...args: any[]) => any>(
  callback: CallBack,
  option?: {
    stop?: boolean;
    prevent?: boolean;
  }
) {
  const self = getCurrentInstance().proxy;
  return function (e) {
    if (e) {
      option?.stop && e.stopPropagation?.();
      option?.prevent && e.preventDefault?.();
    }
    return callback.apply(self, arguments);
  } as CallBack;
}

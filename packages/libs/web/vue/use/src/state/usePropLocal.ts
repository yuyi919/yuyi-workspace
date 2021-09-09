import { isWrap, strictThen, unwrap, WrapValue } from "../shared";
import { computed, reactive, ref, Ref, set, watch } from "vue-demi";
import { debounce, isEqual } from "lodash";

interface LinkOptions<T, P = T> {
  flush?: "pre" | "post" | "sync";
  immediate?: boolean;
  deep?: boolean;

  delay?: number;

  /**
   * 管道配置
   */
  pipe?: {
    fromProp?: (value: P) => T | Promise<T>;
    toProp?: (value: T) => P;
    /**
     * 阻止更新
     * @return true为阻止
     */
    block?: (value: any) => boolean;

    /**
     * 更新被阻止时是否清除现有local
     * @default false
     */
    clearOnBlocked?: boolean;
  };
}

/**
 * 工具hooks，prop的local化
 * @param prop
 * @param callback
 * @param option 参照watch
 */
export function usePropLocal<T, P = T>(
  prop: WrapValue<P>,
  callback?: (update: P, prev?: P) => any,
  option?: LinkOptions<T, P>
) {
  const { pipe: pipeOption, delay, immediate, ...watchOption } = option || {};
  if (callback && typeof delay === "number" && delay >= 0) {
    callback = debounce(callback, delay);
  }
  const deep = watchOption.deep || false;
  const pipe = pipeOption || ({} as LinkOptions<T, P>["pipe"]);
  const initial = P2T(unwrap(prop));
  const localVal: Ref<T> = ref() as Ref<T>;
  if (initial instanceof Promise) {
    initial.then((initial) => (localVal.value = initial));
  } else {
    localVal.value = initial;
  }
  let stop: () => void, stop2: () => void;
  const action = {
    clear() {
      if (localVal.value !== void 0) {
        // console.log("update on clear undefined");
        localVal.value = void 0;
      }
    },
    stop: () => {
      stop && stop();
      stop2 && stop2();
    },
    update: (value: T, force?: boolean) => {
      if (force && !isBlockedProp(value)) {
        set(localVal, "value", (value === null ? void 0 : value) as T);
      } else if (!isEqualV(localVal.value, value) && !isBlockedProp(value)) {
        // console.log("update on event", JSON.stringify(value));
        localVal.value = (value === null ? void 0 : value) as T;
      }
    },
  };
  if (isWrap(prop)) {
    stop = watch(
      prop as () => P,
      (receive: P) => {
        strictThen(P2T(receive), (propValue) => {
          if (!isEqualV(localVal.value, propValue) && !isBlockedProp(propValue)) {
            // console.log("update on prop", JSON.stringify(propValue));
            localVal.value = propValue as T;
          }
        });
      },
      { ...watchOption, immediate }
    );
    stop2 = watch(
      localVal,
      (local, prev) => {
        // console.log("localValue", local);
        if (callback) {
          const value = T2P(local);
          const prevValue = T2P(prev);
          const propValue = unwrap(prop);
          // console.log({ local, prev, value, prevValue, propValue });
          if (!isEqualV(value, prevValue) || !isEqualV(value as any, propValue as any)) {
            callback(value, prevValue);
          }
        }
      },
      watchOption
    );
  }
  return [computed(() => localVal.value), action] as const;

  function isBlockedProp(propValue: T) {
    const result = pipe.block?.(propValue);
    if (result && pipe.clearOnBlocked) {
      action.clear();
    }
    return result;
  }

  function P2T(receive: P): T | Promise<T> {
    return (pipe.fromProp ? pipe.fromProp(receive) : receive) as T;
  }
  function T2P(receive: T): P {
    return (pipe.toProp ? pipe.toProp(receive) : receive) as P;
  }
  function isEqualV<T>(a: T, b: T) {
    return deep ? isEqual(a, b) : a === b;
  }
}

export function useVModel<T = any, P = T>(
  prop: WrapValue<P>,
  callback?: (update: P, prev?: P) => any,
  option?: LinkOptions<T, P>
) {
  const [localVal, action] = usePropLocal<T, P>(prop, callback, option);
  return [
    localVal,
    reactive({
      value: localVal,
      callback: action.update,
    }),
    action,
  ] as const;
}

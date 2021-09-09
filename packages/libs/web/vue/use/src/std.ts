/* eslint-disable no-redeclare */
import {
  onMounted,
  ref,
  onUnmounted,
  Ref,
  reactive,
  onUpdated,
  getCurrentInstance,
  computed,
  nextTick,
  shallowRef,
  onBeforeUnmount,
  ComputedRef,
  watch,
  WatchStopHandle,
} from "vue-demi";
import { VNode } from "vue";
import { isEqual } from "lodash";
import * as $expect from "./is";
import { Types } from "@yuyi919/shared-types";

declare interface Fn<T = any, R = T> {
  (...arg: T[]): R;
}

type State<T> = ((s: T) => T) | T;
type Dispatch<T> = (t: T) => void;

type DispatchState<T> = Dispatch<State<T>>;

type ResultState<T> = Readonly<Ref<T>>;

/**
 * 仿react的useState
 * */
export function useState<T extends undefined>(
  initialState: (() => T) | T
): [ResultState<T>, DispatchState<T>];

export function useState<T extends null>(
  initialState: (() => T) | T
): [ResultState<T>, DispatchState<T>];

export function useState<T extends boolean>(
  initialState: (() => T) | T
): [ResultState<boolean>, DispatchState<boolean>];

export function useState<T extends string>(
  initialState: (() => T) | T
): [ResultState<string>, DispatchState<string>];

export function useState<T extends number>(
  initialState: (() => T) | T
): [ResultState<number>, DispatchState<number>];

export function useState<T extends Types.Recordable>(
  initialState: (() => T) | T
): [Readonly<T>, DispatchState<T>];

export function useState<T extends any>(
  initialState: (() => T) | T
): [Readonly<T>, DispatchState<T>];

export function useState<T>(initialState: (() => T) | T): [ResultState<T> | T, DispatchState<T>] {
  if ($expect.isFunction(initialState)) {
    initialState = (initialState as Fn)();
  }

  if ($expect.isObject(initialState)) {
    const state = reactive({ data: initialState }) as any;
    const setState = (newState: T) => {
      state.data = newState;
    };
    return [state, setState];
  } else {
    const state = ref(initialState) as any;
    const setState = (newState: T) => {
      state.value = newState;
    };
    return [state, setState];
  }
}

/**
 * 仿react的useEffect
 * @param mounted
 */
export function useEffect(mounted: () => () => void) {
  let disposer: () => void;
  onMounted(() => {
    disposer = mounted();
  });
  onUnmounted(() => {
    disposer && disposer();
  });
}

export function useEffect2<T extends any = any>(
  effectHandler: (deps: T[], prevDeps?: T[]) => () => void,
  dependencies: T[]
): WatchStopHandle {
  return watch(
    dependencies,
    (changedDependencies, prevDependencies, onCleanUp) => {
      const effectCleaner = effectHandler(changedDependencies, prevDependencies);
      if (effectCleaner instanceof Function) {
        onCleanUp(effectCleaner);
      }
    },
    { immediate: true, deep: true }
  );
}

export function useNamedRef<T>(name: string): Ref<T | null> & { name: string; ref(): Ref<T> } {
  const context = getCurrentInstance();
  // 必须传递一个初始值null，否则会有意想不到的问题
  const refObj = ref<any>(null);
  const update = () => {
    const next = (context.refs[name] as T) || null;
    if (next !== refObj.value) refObj.value = next;
  };
  const updateHook = () => (update(), nextTick(update));
  onMounted(updateHook);
  onUpdated(updateHook);
  onUnmounted(() => refObj.value = null)
  const namedRef = reactive({
    value: refObj,
    name,
    ref() {
      return refObj;
    },
  });
  return namedRef as Ref<T | null> & { name: string; ref(): Ref<T> };
}

export function useComponentEl<T extends HTMLElement>(strict?: boolean) {
  const self = getCurrentInstance();
  if (strict) {
    const elRef: Ref<T> = shallowRef();
    // eslint-disable-next-line no-inner-declarations
    function sync() {
      const elm = self.proxy.$vnode.elm as T;
      if (elm !== elRef.value) {
        elRef.value = elm;
      }
    }
    onUpdated(() => {
      requestAnimationFrame(sync);
    });
    onMounted(() => {
      requestAnimationFrame(sync);
    });
    return elRef as ComputedRef<T>;
  }
  return computed<T>(() => {
    return self.proxy.$vnode.elm as T;
  }) as ComputedRef<T>;
}

export function useQuerySelector(selector?: string) {
  const elRef = useComponentEl();
  const selectorRef: Ref<HTMLElement> = shallowRef();
  function sync() {
    if (elRef.value && elRef.value.querySelector instanceof Function) {
      const finded = elRef.value.querySelector(selector) as HTMLElement;
      if (selectorRef.value !== finded) {
        selectorRef.value = finded;
      }
    }
  }
  onUpdated(() => {
    requestAnimationFrame(sync);
  });
  onMounted(() => {
    requestAnimationFrame(sync);
  });
  return selectorRef;
}

export function useChildren(self = getCurrentInstance().proxy) {
  const childrenRef: Ref<VNode[]> = shallowRef([]);
  onUpdated(() => {
    nextTick(() => {
      if (!isEqual(self.$slots.default, childrenRef.value)) {
        childrenRef.value = self.$slots.default;
      }
    });
  });
  childrenRef.value = self.$slots.default;
  return childrenRef;
}

export function useDisposer(autoHooks?: boolean) {
  let disposer: (() => void)[] = [];
  const store = {
    dispose() {
      if (!disposer) return Error("isDisposed");
      for (const dis of disposer) {
        dis();
      }
      disposer = void 0;
    },
    add(handle: () => void) {
      disposer.push(handle);
    },
    remove(handle: () => void) {
      disposer = disposer.filter((h) => h !== handle);
    },
  };
  if (autoHooks) {
    onBeforeUnmount(store.dispose);
  }
  return store;
}


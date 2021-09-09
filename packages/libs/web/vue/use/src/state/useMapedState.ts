import { computed, ComputedRef, ref, Ref } from "vue-demi";
import { unwrap } from "../shared";

export function useMapedState<S extends Record<string, any>>(
  defaultState?: S
): readonly [
  get: <K extends keyof S>(
    key: K,
    defaultValue?: (() => S[K]) | Ref<S[K]> | S[K],
    initialize?: boolean
  ) => S[K],
  set: <K extends keyof S>(key: K, value: S[K] | Ref<S[K]>, force?: boolean) => S[K],
  state: Ref<S>
] {
  const dataRef = ref<S>(defaultState || ({} as S));
  function get<K extends keyof S>(
    key: K,
    defaultValue?: (() => S[K]) | Ref<S[K]>,
    initialize?: boolean
  ): S[K] {
    const value = (dataRef.value as S)[key];
    if (defaultValue !== void 0 && (!(key in dataRef.value) || value === void 0)) {
      if (initialize) {
        set(key, defaultValue instanceof Function ? computed(defaultValue) : defaultValue, true);
        return get(key);
      } else {
        return unwrap(defaultValue);
      }
    }
    return value;
  }
  function set<K extends keyof S>(key: K, value: S[K] | Ref<S[K]>, force?: boolean) {
    if (value == null) {
      const { [key]: v, ...other } = dataRef.value;
      dataRef.value = other;
    } else if (!force && key in dataRef.value) {
      (dataRef.value as S)[key] = value as S[K];
    } else {
      dataRef.value = {
        ...dataRef.value,
        [key]: value,
      };
    }
    return value as S[K];
  }
  return [get, set, dataRef as Ref<S>];
}

export function useMapedToggle<K extends string = string>(
  defaultState?: Record<K, boolean>
): readonly [
  get: (key: K) => Record<K, boolean>[K],
  set: (key: K, bool?: boolean, force?: boolean) => void,
  toggledKeys: ComputedRef<K[]>,
  toggled: ComputedRef<boolean>,
  toggledMap: Ref<Record<K, boolean>>
] {
  const [get, set, ref] = useMapedState<Record<K, boolean>>(defaultState);
  const toggledKeys = computed<K[]>(() => {
    return Object.keys(ref.value || {}).filter((key) => ref.value[key]) as K[];
  });

  return [
    get,
    (key: K, bool: boolean = !get(key), force?: boolean) => {
      set(key as K, bool, force);
    },
    toggledKeys,
    computed(() => {
      return toggledKeys.value?.length > 0;
    }),
    ref,
  ];
}

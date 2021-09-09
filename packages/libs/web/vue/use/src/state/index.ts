/* eslint-disable no-unused-expressions */
import { computed } from "vue-demi";
import { useWrap, WrapValue } from "../shared";

export function useArrayMapedState<T = any>(getter: WrapValue<T[]>) {
  const values = useWrap(getter);
  return [
    values,
    computed(() => {
      const map = new Map<T, boolean>();
      if (values.value?.length) {
        for (let i = 0; i < values.value.length; i++) {
          map.set(values.value[i], true);
        }
      }
      return map;
    }),
  ] as const;
}

export * from "./useMapedState";
export * from "./usePropLocal";

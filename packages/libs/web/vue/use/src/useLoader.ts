/* eslint-disable prefer-rest-params */
/* eslint-disable prefer-spread */
/* eslint-disable no-throw-literal */
/* eslint-disable no-redeclare */
import { reactive, Ref, ref } from "vue-demi";
import { Types } from "@yuyi919/shared-types";

// const emptyPromise = new Promise(() => {});

export function useLoader<
  Query extends (...args: any[]) => Promise<any>,
  Args extends Types.Function.ExtractArgs<Query>,
  Result extends Types.PromiseValue<ReturnType<Query>>
>(
  loader: (...args: Args) => Promise<Result>,
  initialValues?: Result,
  defaultLoading?: boolean
): {
  data: Ref<Result>;
  load(...args: Args): Promise<Result>;
  loading: Ref<boolean>;
  loadStatus: Ref<"done" | "wait" | "error">;
};
export function useLoader<T>(
  loader: () => Promise<T>,
  initialValues?: T,
  defaultLoading?: boolean
): {
  data: Ref<T>;
  load(): Promise<T>;
  loading: Ref<boolean>;
};
export function useLoader<T>(loader: () => Promise<T>, initialValues?: T, defaultLoading = false) {
  const loading = ref(defaultLoading);
  const loadStatus = ref<"done" | "wait" | "error">();
  const data = ref<T | undefined>(initialValues);
  let timeflag = 0;
  async function load() {
    try {
      const flag = ++timeflag;
      loading.value = true;
      loadStatus.value = "wait";
      const res: T = await loader.apply(null, arguments);
      if (flag === timeflag) {
        data.value = res as any;
        loadStatus.value = "done";
        return res;
      }
      throw "abort";
    } catch (error) {
      loadStatus.value = "error";
      throw error;
    } finally {
      loading.value = false;
    }
  }
  return {
    loading,
    load,
    loadStatus,
    data,
  };
}

export function useLoaderInstance<T>(
  loader: () => Promise<T>,
  initialValues?: T,
  defaultLoading?: boolean
): {
  loading: boolean;
  load(): Promise<T>;
  data: T;
};
export function useLoaderInstance<
  Query extends (...args: any[]) => Promise<any>,
  Args extends Types.Function.ExtractArgs<Query>,
  Result extends Types.PromiseValue<ReturnType<Query>>
>(
  loader: Query,
  initialValues?: Result,
  defaultLoading?: boolean
): {
  loading: boolean;
  load(...args: Args): Promise<Result>;
  data: Result;
};
export function useLoaderInstance<
  Query extends (...args: any[]) => Promise<any>,
  Args extends Types.Function.ExtractArgs<Query>,
  Result extends Types.PromiseValue<ReturnType<Query>>
>(loader: Query, initialValues?: Result, defaultLoading?: boolean) {
  return reactive(useLoader(loader, initialValues, defaultLoading)) as {
    loading: boolean;
    load(...args: Args): Promise<Result>;
    data: Result;
  };
}

export interface IDataLoader<Result, Args extends any[]> {
  loading: boolean;
  load(...args: Args): Promise<Result>;
  data: Result;
}

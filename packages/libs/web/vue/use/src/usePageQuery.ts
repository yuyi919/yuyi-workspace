/* eslint-disable no-throw-literal */
/* eslint-disable no-redeclare */
import { computed, nextTick, reactive, ref, watch } from "vue-demi";
import { defaults } from "lodash";
import { useLoader } from "./useLoader";

export interface CommonPageData<T = any> {
  pageSize: number;
  pageNum: number;
  total?: number;
  list?: T[];
  [k: string]: any;
}
export type InternalPageConfig = {
  pageSize?: number;
  current?: number;
  total?: number;
};

export type TReverseKV<
  Source extends Record<string, any>,
  Keys extends keyof Source = keyof Source
> = {
  [ValueKey in Source[Keys]]: Extract<
    { [Key in Keys]: [Source[Key], Key] }[Keys],
    [ValueKey, any]
  >[1];
};

export function usePageQuery<
  PageNumKey extends string = "pageNum",
  PageSizeKey extends string = "pageSize",
  PageTotalKey extends string = "total",
  QueryPageConfig extends {
    [K in keyof TReverseKV<{
      pageSize: PageSizeKey;
      current: PageNumKey;
      total: PageTotalKey;
    }>]: number;
  } = {
    [K in keyof TReverseKV<{
      pageSize: PageSizeKey;
      current: PageNumKey;
      total: PageTotalKey;
    }>]: number;
  },
  T = any
>(args: {
  initialLoad?: boolean;
  pageConfigKeys?: {
    pageSize?: PageSizeKey;
    current?: PageNumKey;
    total?: PageTotalKey;
  };
  getData: (page: QueryPageConfig) => Promise<CommonPageData<T>>;
  pageConfig?: any;
}) {
  const { pageConfigKeys = {}, initialLoad = true } = args;
  const startLoad = ref(initialLoad);
  // const data = ref<CommonPageData<T> | undefined>();
  // const loading = ref<boolean>(false);
  function commonToInternal(sourceParam: CommonPageData<T>) {
    const { pageSize = "pageSize", current = "current", total = "total" } = pageConfigKeys;
    return {
      pageSize: sourceParam[pageSize],
      current: sourceParam[current],
      total: sourceParam[total],
    };
  }
  function internalToCommon(sourceParam: InternalPageConfig): QueryPageConfig {
    const { pageSize = "pageSize", current = "current", total = "total" } = pageConfigKeys;
    return {
      [pageSize]: sourceParam.pageSize,
      [current]: sourceParam.current,
      [total]: sourceParam.total,
    } as QueryPageConfig;
  }
  const pageConfig = reactive<InternalPageConfig>(
    defaults(commonToInternal(args.pageConfig || {}), {
      current: 1,
      pageSize: 5,
    })
  );
  function onPageConfigChange(page: InternalPageConfig) {
    pageConfig.current = page.current;
    pageConfig.pageSize = page.pageSize;
    pageConfig.total = page.total;
  }

  const { loading, data, ...loader } = useLoader(async () => {
    const queryParams = internalToCommon(pageConfig);
    if (startLoad.value) {
      console.log("query:params", queryParams);
      return args.getData(queryParams);
    }
    return ({ list: [], ...queryParams } as unknown) as CommonPageData<T>;
  });

  const handleQuery = async (query?: string) => {
    try {
      const res = await loader.load();
      console.log("query:end", query, res);
      return res;
    } catch (error) {
      return data.value;
    }
  };
  // const swr = request.useSwrv<CommonPageData<T> | undefined>(
  //   () =>
  //     startLoad.value
  //       ? `dataTableQuery|${pageConfig.current}|${pageConfig.pageSize}`
  //       : "dataTableQuery|initial",
  //   handleQuery,
  //   { cache: undefined }
  // );
  if (startLoad.value) {
    // swr.data.value &&
    onPageConfigChange(commonToInternal(args.pageConfig));
  }
  watch(
    () =>
      startLoad.value ? `query:${pageConfig.current},${pageConfig.pageSize}` : "query:initial",
    (key) => handleQuery(key),
    { immediate: true }
  );

  return {
    // swr,
    loading,
    data,
    dataList: computed(() => data.value?.list || []),
    pageConfig,
    refresh(start?: boolean | number) {
      startLoad.value = true;
      nextTick(() => {
        if (typeof start === "number" && start > 0) {
          pageConfig.current = start;
        } else if (start === true) {
          pageConfig.current = 1;
        }
        return handleQuery(); // swr.mutate(, { forceRevalidate: false });
      });
    },
    onPageConfigChange,
  };
}

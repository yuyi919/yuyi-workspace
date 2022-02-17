/* eslint-disable */
import { unwrap } from "@yuyi919/vue-use";
import { WrapValue } from "@yuyi919/shared-types";
import { convertArr2Map } from "@yuyi919/shared-utils";
import { reactive, toRef } from "vue-demi";

export class CodeFilter<K extends string> {
  constructor(
    private source: WrapValue<K[]>,
    private include?: WrapValue<K[]>,
    private exclude?: WrapValue<K[]>
  ) {}

  protected includePipe: ((str: K[]) => K[])[] = [];
  public addIncludePipe(pipe: (str: K[]) => K[]) {
    if (!this.includePipe.includes(pipe)) {
      this.includePipe = [...this.includePipe, pipe];
    }
  }

  protected excludePipe: ((str: K[]) => K[])[] = [];
  public addExcludePipe(pipe: (str: K[]) => K[]) {
    if (!this.excludePipe.includes(pipe)) {
      this.excludePipe = [...this.excludePipe, pipe];
    }
  }

  public get filtered() {
    return this.filter(unwrap(this.source), unwrap(this.include), unwrap(this.exclude));
  }
  /**
   * 同computedDisplayList，区别为返回一个对象，如果根据对应的key取值判断是否展示
   */
  public get filteredMap() {
    // console.log('localDisplayMap', this.computedDisplayList)
    return this.filtered.length > 0 ? convertArr2Map(this.filtered) : {};
  }

  /**
   * 根据display和hidden配置汇总出的displayKey数组
   */
  public filter(source: K[], include?: K[], exclude?: K[]) {
    // console.log(this)
    // 取静态display, 如果是数组则取 当前全部
    const display = include || source;
    if (display instanceof Array) {
      const pipedDisplay: K[] =
        this.includePipe.length > 0
          ? this.includePipe.reduce((r, pipe) => pipe(r), display)
          : display;
      // 有静态hidden则过滤
      const filteredDisplay =
        exclude && exclude.length > 0
          ? pipedDisplay.filter((d) => !exclude.includes(d))
          : pipedDisplay;
      // 额外处理管道
      return this.excludePipe.length > 0
        ? this.excludePipe.reduce((r, pipe) => pipe(r), filteredDisplay)
        : filteredDisplay;
    }
    return [];
  }
}

export function useCodeFilter<K extends string>(
  source: WrapValue<K[]>,
  include: WrapValue<K[]>,
  exclude: WrapValue<K[]>
) {
  const actions = reactive(new CodeFilter<K>(source, include, exclude)) as unknown as CodeFilter<K>;
  return [
    reactive({
      filtered: toRef(actions, "filtered"),
      filteredMap: toRef(actions, "filteredMap"),
    }),
    actions,
  ] as [Pick<CodeFilter<K>, "filtered" | "filteredMap">, CodeFilter<K>];
}

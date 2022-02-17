import { convertArr2Map } from "@yuyi919/shared-utils";
import type { IKeyValueMap } from "@yuyi919/shared-types";
import { HookFactory, useHookFactory } from "@antv-plus2/helper";
import { watch, SetupContext } from "vue-demi";
import { SpinningProps } from "./props";

export class SpinningHook extends HookFactory<SpinningProps> {
  constructor(context: SetupContext, props: SpinningProps) {
    super(context, props);
    watch(() => this.localSpinning!, this.onSpinningUpdated.bind(this), { immediate: true });
    watch(() => this.props.spinning!, this.setSpinning.bind(this), { immediate: true });
  }

  public localSpinning = false;

  setSpinning(spinning: boolean) {
    if (spinning !== this.localSpinning) {
      // console.log('spinning changed', spinning)
      this.localSpinning = spinning;
    }
  }

  onSpinningUpdated(spinning: boolean) {
    /**
     * 更新加载中标志状态
     * @type { boolean }
     */
    this.$emit("update:spinning", spinning);
  }

  get isSpinning() {
    return this.localSpinning;
  }

  public toggleSpinning(spinning: boolean) {
    this.localSpinning = spinning;
  }
}

export class ActionSpinningHook extends SpinningHook {
  constructor(context: SetupContext, props: SpinningProps) {
    super(context, props);
    watch(
      () => this.actionSpinning,
      (spinning) => this.toggleSpinning(spinning),
      { immediate: true }
    );
  }
  public $install() {}

  // @Watch("actionSpinning", { immediate: true })
  // protected onActionSpinningChanged = (spinning: boolean) => {
  //   this.toggleSpinning(spinning);
  // }

  public spinningActionMap: {
    [name: string]: boolean;
  } = {};
  /** 不会进入spinning识别的code */
  public spinningWhiteList?: string[];
  public get spinningWhiteMap(): IKeyValueMap<boolean> {
    return (this.spinningWhiteList && convertArr2Map(this.spinningWhiteList)) || {};
  }
  public isActionSpinning(actionName: string, strict = false) {
    return this.spinningActionMap[actionName] || (!strict && this.spinningActionMap[actionName]);
  }
  public get spinningAction(): string[] {
    const r: string[] = [];
    for (const [name, loading] of Object.entries(this.spinningActionMap)) {
      loading && r.push(name);
    }
    return r;
  }
  public get actionSpinning() {
    return this.spinningAction.length > this.actionSpinningThreshold;
  }

  private actionSpinningThreshold = 0;

  /**
   * 设置整体spinning的阈值，当有超过这个数字的action处于spinning状态中时才会切换整体spinning
   * @param thresold 默认值为0
   * @public
   */
  public setActionThreshold(thresold: number = 0) {
    this.actionSpinningThreshold = thresold;
  }

  public get isSpinning() {
    return this.actionSpinning || this.localSpinning;
  }
  public set isSpinning(spinning: boolean) {
    this.localSpinning = spinning;
  }

  public spinningStart(name: string) {
    if (!this.spinningWhiteList || !this.spinningWhiteMap[name]) {
      this.spinningActionMap[name] = true;
      this.spinningActionMap = { ...this.spinningActionMap };
    }
  }
  public spinningEnd(name: string) {
    if (this.spinningActionMap[name]) {
      this.spinningActionMap[name] = false;
    }
  }
}

export function useSpinning(props: SpinningProps, context: SetupContext) {
  return useHookFactory(SpinningHook, context, props);
}

export function useActionSpinning(props: SpinningProps, context: SetupContext) {
  return useHookFactory(ActionSpinningHook, context, props);
}

export { SpinningProps };

import { sleep } from "@yuyi919/shared-utils";
import { HookFactory, useHookFactory } from "../helper";
import { castArray, defaults, delay, isObject, merge } from "lodash";
import { h, SetupContext } from "vue-demi";
import { getConfirmContainerComponent } from "./createAction";
import { IButtonProps, utils } from "../shared";
import { convertArrayProps } from "./castProps";
import {
  BaseActionConfig,
  ActionType,
  ICallableActionConfig,
  IActionConfig,
  IListenableActionConfig,
} from "./interface";
import ActionGroupProps, { DefaultActionMap } from "./Props";
import { Types } from "@yuyi919/shared-types";
const { useActionSpinning, useCodeFilter } = utils;
const hooks = {};
type InnerActionConfig<
  T extends ActionType = ActionType,
  Type extends "event" | "handler" = any
> = Types.RequiredTo<
  Type extends "handler" ? ICallableActionConfig<T> : IListenableActionConfig<T>,
  "type" | "name" | "component" | "actionType" | "render"
>;
// console.log('DefaultActionMap', DefaultActionMap)
export function isDefaultActionType(type: string): type is ActionType {
  return !!DefaultActionMap[type as ActionType];
}
/**
 * 取得按钮的展示文字
 * @param action 按钮动作配置
 * @param useTypeOverwrite 是否优先根据按钮类型
 */

export function getActionTitle(
  action: BaseActionConfig,
  useTypeOverwrite = false
): string | undefined {
  if (useTypeOverwrite && action.type !== "custom") {
    return DefaultActionMap[action.type!] || action.title || action.name;
  }
  return action.title
    ? action.title
    : action.type === ActionType.自定义
    ? action.name
    : DefaultActionMap[action.type!];
}
// export type A = keyof AntProps<InstanceType<typeof actionNameListFilter>>;
// Mixins(
//   ActionNameListFilter,
//   CommonSpinningMixin,
//   ActionGroupProps
// )
/**
 * 封装过的操作按钮栏，包含异步操作等待时隐藏其它按钮、展示loading等实用功能
 * @displayName OperationBar
 */

export class ActionGroupHooks extends HookFactory<ActionGroupProps> {
  constructor(
    context: SetupContext,
    props: ActionGroupProps,
    private $actionSpinning: utils.ActionSpinningHook = useActionSpinning(props, context),
    private $filter?: utils.CodeFilter<string>
  ) {
    super(context, props);
    const filter = useCodeFilter(
      () => this.actionNameList,
      () => props.display,
      () => props.hidden
    );
    this.$filter = filter[1];
  }

  get actionList(): InnerActionConfig[] {
    const r = convertArrayProps(
      this.props.actions,
      (value, key) => {
        return this.getActionBase(
          key && value
            ? {
                title: value,
                name: key,
              }
            : value
        );
      },
      1
    ) as InnerActionConfig[];
    // console.error('actionList', r)
    return this.props.reverse ? r.reverse() : r;
  }

  get localPrimaryConfig() {
    return castArray(this.props.primary);
  }

  get actionNameList(): string[] {
    return this.actionList.map((a) => a.name);
  }

  public getComponent(action: IActionConfig<any>) {
    return action.component || this.props.component;
  }

  public getRender(action: InnerActionConfig): IActionConfig["render"] {
    return (
      action.render ||
      (action.component
        ? (h, $emit, injectProps) => {
            const { component: Button, props, confirm, type } = action;
            const style = injectProps.style
              ? defaults(injectProps.style, action.style)
              : action.style;
            const Confirm =
              confirm && getConfirmContainerComponent(confirm === true ? type : confirm.title);
            const onClick = async (e: MouseEvent) => {
              const ref = this.$refs[`confirm_${action.name}`] as any;
              try {
                ref && ref.setVisible(true);
                onClick.event && (await onClick.event());
                ref && ref.setVisible(false);
              } catch (error) {
                ref && ref.setVisible(true);
                // debugger
              }
            };
            onClick.event = this.getActionEvent(action, $emit)!;
            const buttonProps: IButtonProps = merge(
              {},
              this.props.defaultProps,
              props,
              injectProps,
              this.props.disabled ? { disabled: true } : {}
            );
            const btn = (
              <Button
                style={{
                  ...style,
                  ...(action.float
                    ? {
                        float: action.float,
                      }
                    : {}),
                }}
                class={injectProps.className}
                role={injectProps.role}
                {...{ props: buttonProps, on: Confirm ? {} : { click: onClick } }}
              >
                {(injectProps && injectProps.text) || getActionTitle(action)}
              </Button>
            );
            return Confirm ? (
              <Confirm
                key={action.name}
                loading={buttonProps.loading}
                disabled={buttonProps.disabled}
                ref={`confirm_${action.name}`}
                {...{ props: (confirm as any).props }}
                onClick={onClick}
              >
                {btn}
              </Confirm>
            ) : (
              btn
            );
          }
        : ((() => false) as any))
    );
  }

  public isHandlerAction(
    action: InnerActionConfig
  ): action is InnerActionConfig<ActionType, "handler"> {
    return action.actionType === "handler";
  }

  static useSpinning = Symbol("rejectSpinning");
  public getActionEvent(action: InnerActionConfig<ActionType>, $emit: any) {
    const { name, actionType } = action;
    if (this.isHandlerAction(action)) {
      // 事件句柄直接返回
      return async () => {
        const result = action.action();
        const isDelay = result instanceof Promise;
        if (
          isDelay &&
          (await Promise.race([sleep(100, ActionGroupHooks.useSpinning), result])) ===
            ActionGroupHooks.useSpinning
        ) {
          this.$actionSpinning.spinningStart(name);
          return Promise.race([Promise.all([result, sleep(300)]), this.waitingCancel()])
            .catch((e) => {
              console.error(e);
              throw e;
            })
            .finally(() => {
              this.$actionSpinning.spinningEnd(name);
            });
        }
      };
    } else if (name) {
      // 事件传递，传递name对应的事件，并将action作为参数\
      return async () => this.handleEmitAction(action as InnerActionConfig<ActionType, "event">);
    }
  }

  /**
   * 传递action事件
   */
  public handleEmitAction({ name, action }: InnerActionConfig<ActionType, "event">) {
    console.error("call", name);
    // const handler = this.$listeners[name] as any
    const args = castArray(action);
    this._handleEmitOneAction(name, args);
    this._handleEmitAllAction(name, args);
  }

  private _handleEmitOneAction(name: string, args: any[]) {
    /**
     * 当action不为函数，点击按钮时传递[<(Action.)name>]事件
     * @event <Action.name>
     * @param {...any[]} args config中的action（数组的情况会展开）
     */
    this.$emit(name, ...args);
  }

  private _handleEmitAllAction(name: string, args: any[]) {
    /**
     * 集中处理的action事件
     * @event action
     * @param {string} name action名
     * @param {...any[]} args 参照[<Action.name>]
     */
    this.$emit("action", name, ...args);
  }

  public getActionHandler(
    config: IActionConfig<ActionType>
  ): undefined | (() => void | Promise<any>) {
    const { action, type = config.name } = config;
    const { defaultActionHandler } = this.props;
    return (
      (action instanceof Function && action) ||
      (defaultActionHandler &&
        defaultActionHandler[type as ActionType] &&
        defaultActionHandler[type as ActionType]!.bind(this, ...castArray(action))) ||
      undefined
    );
  }

  /**
   * 取得名称，无则依次使用函数名/action类型作为名称
   * @param name
   * @param type
   * @param action
   */
  public getActionName(
    name: IActionConfig["name"],
    type: IActionConfig["type"],
    action?: IActionConfig["action"]
  ): string {
    return name || (action && (action as any).name) || type || ActionType.自定义;
  }

  /**
   * 无指定类型时使用name推断，无法推断时则为自定义
   * @param type
   * @param name
   */
  private getActionType(type: IActionConfig["type"], name: IActionConfig["name"]): ActionType {
    return type || (isDefaultActionType(name!) && name) || ActionType.自定义;
  }

  private getActionBase(config: string): InnerActionConfig<ActionType, "event"> | undefined;
  private getActionBase(
    config: IActionConfig<ActionType>
  ): InnerActionConfig<ActionType, "event" | "handler"> | undefined;
  private getActionBase(config: string | IActionConfig<ActionType>): InnerActionConfig | undefined {
    let action: InnerActionConfig | undefined;
    if (typeof config === "string") {
      action = {
        type: isDefaultActionType(config) ? config : ActionType.自定义,
        name: config,
        component: this.props.component,
        actionType: "event",
      } as InnerActionConfig;
    } else if (isObject(config)) {
      const { name, type } = config;
      const actionHandler = this.getActionHandler(config); // action是否配置为函数
      action = {
        ...config,
        action: actionHandler,
        name: this.getActionName(name, type, actionHandler),
        type: this.getActionType(type, name),
        component: this.getComponent(config),
        actionType: actionHandler ? "handler" : "event",
      } as InnerActionConfig;
    }
    if (action!) {
      action.render = this.getRender(action)!;
    }
    return action!;
  }

  emitEvent(event: string, arg: any, ...args: any[]) {
    return this.$emit(event, arg, ...args);
  }

  get localDisplayActionList() {
    const r: InnerActionConfig[] = [];
    for (const a of this.actionList) {
      if (this.$filter!.filteredMap[a.name!]) {
        r.push(a);
      }
    }
    return r;
  }

  /** 取得按钮展示的类型Prop */
  getButtonType(action: InnerActionConfig): any {
    const nativeType = action.props && action.props.type;
    // console.log("getButtonType", action);
    return (
      (!nativeType &&
        (this.localPrimaryConfig.includes(action.name) ||
          this.localPrimaryConfig.includes(action.type) ||
          this.$actionSpinning.isActionSpinning(action.name)) &&
        "primary") ||
      nativeType
    );
  }

  spinningWhiteList = [ActionType.CANCEL$];

  get actionCancelBtn() {
    return (
      (this.props.allowCancel &&
        this.getActionBase({
          type: ActionType.CANCEL$,
          name: ActionType.CANCEL$,
        })) ||
      false
    );
  }

  showActionCancel = false;

  __cancelConfirmDelay!: number;
  __cancelPromise!: Promise<any> | null;

  waitingCancel() {
    if (!this.__cancelPromise) {
      this.__cancelPromise = new Promise<void>((resolve) => {
        // console.log('waitingCancel')
        this.$once(ActionType.CANCEL$, () => {
          // console.log('waitingCancel')
          resolve();
          this.__cancelPromise = null;
        });
      });
    }
    return this.__cancelPromise;
  }

  // @Watch("actionSpinning")
  onActionSpinningChange(spinning: any) {
    clearTimeout(this.__cancelConfirmDelay);
    this.__cancelConfirmDelay = delay(
      (allow: boolean) => {
        this.showActionCancel = allow;
      },
      spinning ? 2000 : 0,
      spinning
    );
  }

  getAppendProps<T extends ActionType>(
    config: InnerActionConfig<T>
  ): Partial<IButtonProps> & { text?: string } {
    if (this.isOtherAction<T>(config)) {
      return { type: this.getButtonType(config) };
    } else if (this.$actionSpinning.isActionSpinning(config.name)) {
      // console.error('display', a.title, this.isSpinning, cloneDeep(this.spinningActionMap))
      return {
        loading: true,
        type: this.getButtonType(config),
        ghost:
          (config.props ? config.props.ghost : void 0) ||
          !config.props ||
          config.props.type !== "primary",
        text: getActionTitle(config, true) + "中...",
        ...this.props.defaultSpinningProps,
        ...(config.spinningProps || {}),
      };
    } else {
      // console.error('hidden', a.title, this.isSpinning, cloneDeep(this.spinningActionMap))
      return config.hiddenProps || this.props.hiddenProps || {};
    }
  }

  private isOtherAction<T extends ActionType>(
    config: Types.RequiredTo<
      ICallableActionConfig<T> | IListenableActionConfig<T>,
      "type" | "name" | "component" | "actionType" | "render"
    >
  ) {
    return (
      (!this.$actionSpinning.actionSpinning && config.type !== ActionType.CANCEL$) ||
      (this.showActionCancel &&
        this.$actionSpinning.actionSpinning &&
        config.type === ActionType.CANCEL$)
    );
  }

  get renderer() {
    let actionList = this.localDisplayActionList;
    const r: any[] = [];
    if (this.actionCancelBtn) {
      actionList = [...actionList];
      actionList[this.props.align !== "left" ? "unshift" : "push"](this.actionCancelBtn);
    }
    // console.error(this.isSpinning, cloneDeep(this.spinningActionMap), this.actionCancelBtn)
    for (const action of actionList) {
      r[r.length] =
        // (this.isOtherAction(action) || this.$actionSpinning.isActionSpinning(action.name)) &&
        action.render(h, this.emitEvent, this.getAppendProps(action));
    }
    return r;
  }

  render() {
    const content = this.getSpinningContentSlot("content");
    // console.log('children', this.children)
    const { inline, flex, align } = this.props;
    const bar = (
      <div
        // tag="div"
        class={["operation-bar", inline && "inline", flex && "flex"]}
        style={{ textAlign: (inline && "") || align }}
      >
        {this.renderer}
        {this.getSpinningContentSlot("default")}
      </div>
    );
    return content ? { 0: content, 1: bar } : bar;
  }
  getSpinningContentSlot(name: string) {
    return (
      this.$slots[name] &&
      this.$slots[name]!.length > 0 && (
        <a-spin spinning={this.$actionSpinning.isSpinning}>
          {
            /** @slot Use this slot to have a header */
            this.$slots[name]
          }
        </a-spin>
      )
    );
  }
}

export function useActionGroup(context: SetupContext, props: ActionGroupProps) {
  return useHookFactory(ActionGroupHooks, context, props);
}

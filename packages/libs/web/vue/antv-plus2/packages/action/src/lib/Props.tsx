import { Button, ButtonProps, utils } from "../shared";
import { VueComponent2, Component, Prop, PropsMixins } from "../helper";
import { IActionConfig } from "./interface";
import { Types } from "@yuyi919/shared-types";
import { convertKeys2ValuesMap } from "@yuyi919/shared-utils";
import { ActionType } from "./interface";
import { forEach } from "lodash";

export const DefaultActionMap: Record<ActionType, any> = convertKeys2ValuesMap(
  ActionType as typeof ActionType
);
forEach(DefaultActionMap, (v, k) => {
  if (/\$$/.test(v)) {
    DefaultActionMap[k as ActionType] = v.replace(/\$$/, "") as ActionType;
  }
});

type PickedButtonProps<T extends keyof ButtonProps> = Pick<
  ButtonProps,
  Exclude<keyof ButtonProps, T>
>;
type ActionConfig = (string | IActionConfig)[] | Types.Recordable<string | IActionConfig>;

@Component({})
export class ActionGroupProps extends PropsMixins(utils.SpinningProps) {
  /**
   * 显示指定展示的action
   */
  @Prop({ type: Array })
  public display?: string[];
  /**
   * 显示指定隐藏的action(优先级高于display)
   */
  @Prop({ type: Array })
  public hidden?: string[];

  /**
   * action配置数组
   * @model
   */
  @Prop({ type: [Array, String, Object], required: true })
  public actions!: ActionConfig;

  /**
   * 指定默认使用的按钮组件
   * @default ThemeButton
   */
  @Prop({ type: null, default: () => ActionGroupProps.defaultButton })
  public component?: VueComponent2<ButtonProps>;

  /**
   * 禁用按钮（针对所有按钮）
   */
  @Prop({ type: Boolean, default: false })
  public disabled?: boolean;

  /**
   * 指定主要按钮（使用action.name or action.type）
   * @default null
   */
  @Prop({ type: [String, Array], default: null })
  public primary?: string | string[];

  /**
   * 指定默认按钮组件的默认props
   * @default {}
   */
  @Prop({ type: null, default: () => ({}) })
  public defaultProps?: PickedButtonProps<"loading">;

  /**
   * 指定默认按钮Loading状态下的默认props
   * @default {}
   */
  @Prop({ type: null, default: () => ({}) })
  public defaultSpinningProps?: PickedButtonProps<"loading">;

  /**
   * 指定内置按钮类型的事件句柄
   * @default {}
   */
  @Prop({ type: null, default: () => ({}) })
  public defaultActionHandler?: {
    [K in ActionType]?: (...args: any[]) => void | Promise<any>;
  };

  /**
   * 指定针对异步事件是否可以取消
   * @default true
   */
  @Prop({ type: Boolean, default: false })
  public allowCancel?: boolean;

  /**
   * 默认按钮对齐（默认为right）
   * @default "right"
   */
  @Prop({ type: String, default: "right" })
  public align?: "left" | "center" | "right";

  /**
   * 反向布置ActionButton
   * @default false
   */
  @Prop({ type: Boolean, default: false })
  public reverse?: boolean;

  /**
   * 采用flex布局，这将无视align属性
   * @default false
   */
  @Prop({ type: Boolean, default: false })
  public flex?: boolean;

  /**
   * 采用inline布局，这将无视align属性
   * @default false
   */
  @Prop({ type: Boolean, default: false })
  public inline?: boolean;

  /**
   * 隐藏按钮使用的props
   * @default IAutoOperationBarProps.defaultHiddenProps
   */
  @Prop({
    type: null,
    default: () => ActionGroupProps.defaultHiddenProps,
  })
  public hiddenProps?: PickedButtonProps<"loading">;

  /**
   * 是否在异步事件中隐藏loading状态以外的按钮（不包括超时自动展示的取消按钮）
   * @default true
   */
  @Prop({ type: [Boolean, Array], default: true })
  public hiddenInSpinning?: boolean | string[];

  public static defaultButton = Button;
  public static defaultHiddenProps = {
    style: {
      padding: 0,
      width: 0,
      opacity: 0,
      margin: 0,
      overflow: "hidden",
      border: 0,
      "transition-duration": "0.1s",
      flex: 0,
    },
    icon: null,
    role: "hidden",
    type: "dashed",
    ghost: true,
    disabled: true,
    collapse: true,
  };
}

// console.log(AutoOperationBarProps)

export default ActionGroupProps;

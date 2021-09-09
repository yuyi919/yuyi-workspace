import { IPopconfirmProps } from "ant-design-vue";
import { CreateElement } from "vue";
import { ButtonProps } from "../shared";

export interface IConfirmButtonProps extends IPopconfirmProps {
  confirm?: any;
  getContainer?: IPopconfirmProps["getPopupContainer"];
  loading?: ButtonProps["loading"];
}

export enum ActionType {
  /** 内置取消请求按钮 */
  CANCEL$ = "cancel$",
  自定义 = "custom",
  提交 = "submit",
  确认 = "ok",
  取消 = "cancel",
  载入 = "load",
  返回 = "return",
  跳转 = "url",
  删除 = "delete",
  上传 = "upload",
  查询 = "query",
  新增 = "add",
  查看 = "view",
  详情 = "detail",
  下载 = "download",
  请求 = "fetch",
  编辑 = "edit",
}

export interface BaseActionConfig<Action extends ActionType = ActionType> {
  type?: Action;
  name?: string;
  title?: string;
  render?: (
    h: CreateElement,
    $emit: (name: string, ...args: any[]) => any,
    injectProps: ButtonProps & { text?: string; [key: string]: any }
  ) => JSX.Element;
  component?: any;
  props?: ButtonProps;
  hiddenProps?: ButtonProps;
  spinningProps?: ButtonProps;
  confirm?:
    | boolean
    | {
        title?: string | JSX.Element;
        props?: IConfirmButtonProps;
      };
  style?: any;
  float?: "left" | "right";
}
export interface IListenableActionConfig<Action extends ActionType = ActionType>
  extends BaseActionConfig<Action> {
  actionType?: "event";
  action?: string | any[];
}
export interface ICallableActionConfig<Action extends ActionType = ActionType>
  extends BaseActionConfig<Action> {
  actionType?: "handler";
  action: () => Promise<any> | void;
}
export type IActionConfig<Action extends ActionType = ActionType> =
  | ICallableActionConfig<Action>
  | IListenableActionConfig<Action>;

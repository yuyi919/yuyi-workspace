/* eslint-disable no-useless-constructor */
/* eslint-disable no-use-before-define */
/* eslint-disable prefer-const */
/* eslint-disable one-var */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-inner-declarations */
import { withAsyncOr } from "./withAsyncOr";
import { LocalStorage, CacheCheck } from "./CacheCheck";
import { defaults } from "lodash";
import { Types } from "@yuyi919/shared-types";

// export interface ConfirmOptions
//   extends Omit<ModalOptions, keyof IModalOptionsAdapter | keyof IModalMethodsOptions>,
//     IModalOptionsAdapter,
//     IModalMethodsOptions {}

export interface IModalButtonPropsAdapter {
  type?: string;
}
export interface IModalOptionsAdapter<
  ButtonProps extends IModalButtonPropsAdapter = IModalButtonPropsAdapter
> {
  onCancel?: () => any;
  onClose?: () => any;
  onOk?: () => any;
  /**
   * @override
   */
  title?: any;
  okText?: any;
  okType?: ButtonProps["type"] | Types.DynamicString;
  okButtonProps?: ButtonProps;
  cancelText?: any;
  cancelButtonProps?: ButtonProps;
  autoFocusButton?: string;
  maskClosable?: boolean;
}
export interface IModalConfirmAdapter<T> {
  /**
   * Updates modal options
   * @param modalOptions modal option
   */
  update(modalOptions: Partial<T>): void;

  /**
   * Destroy the current model instace
   */
  destroy(): void;
}

export interface IModalMethodsOptions {
  confirmCacheKey?: string;
  cancelError?: boolean;
  dangerous?: boolean;
  /**
   * 图标类型
   */
  iconType?: string;
  icon?: any;
  /**
   * 设置选择的等待时间，单位为秒
   * 超时返回`cancel`，配合`timeoutResult`更改自动选择返回的结果
   * @default undefined
   */
  timeout?: number;
  /**
   * 设置等待超时后自动返回的结果
   * @default false
   */
  timeoutResult?: boolean;
}
export type AdapterCaller<Options> = (options: Options) => IModalConfirmAdapter<Options>;
export type ConfirmOptionAdapter<
  Options extends IModalOptionsAdapter = IModalOptionsAdapter,
  ModalType extends string = string
> = Omit<Omit<Options, keyof IModalMethodsOptions>, "iconType"> &
  IModalMethodsOptions & {
    iconType?: ModalType | Types.DynamicString;
  };

export type AlertOptionsAdapter<
  Options extends IModalOptionsAdapter = IModalOptionsAdapter,
  ModalType extends string = string
> = Omit<
  Omit<Options, keyof IModalMethodsOptions> & IModalMethodsOptions,
  "cancelText" | "cancelButtonProps" | "iconType" | "cancelError" | "timeout" | "timeoutResult"
> & {
  iconType?: ModalType | Types.DynamicString;
};
export interface AsyncModalAction<Option, Result>
  extends Promise<Result>,
    IModalConfirmAdapter<Option> {
  emit: (result: Result) => void;
}

export function configureModalAdapter<
  ModalOptions extends IModalOptionsAdapter = IModalOptionsAdapter,
  ModalType extends string = string
>(
  modal: {
    [K in "alert" | "confirm"]: AdapterCaller<ModalOptions & IModalMethodsOptions>;
  } &
    {
      [K in ModalType]?: AdapterCaller<ModalOptions & IModalMethodsOptions>;
    }
) {
  type ConfirmOptions = ConfirmOptionAdapter<ModalOptions>;

  type AlertOptions = AlertOptionsAdapter<ModalOptions, ModalType>;

  function _confirm(
    config: ConfirmOptions,
    confirmHandler: AdapterCaller<ModalOptions & IModalMethodsOptions>
  ) {
    const {
      dangerous,
      cancelError,
      confirmCacheKey,
      cancelText,
      onOk,
      onCancel,
      onClose,
      ...other
    } = config;

    let modalHandle: IModalConfirmAdapter<ModalOptions> = null!;
    let emit: (result: boolean) => void;
    const actions = new Promise<boolean>((resolve, reject) => {
      emit = resolve;
      function updateCacheValue(value: boolean) {
        if (!confirmCacheKey) return;
        const { checked } = LocalStorage.get(confirmCacheKey) || {};
        if (checked) {
          // 只有确认按钮才需要缓存
          if (value) {
            LocalStorage.set(confirmCacheKey, { checked, value });
          } else {
            LocalStorage.delete(confirmCacheKey);
          }
        }
      }
      const emitReject = () => {
        updateCacheValue(false);
        (cancelError ? reject : resolve)(false);
      };
      const emitResolve = () => {
        updateCacheValue(true);
        resolve(true);
      };
      if (confirmCacheKey) {
        const { checked, value } = LocalStorage.get(confirmCacheKey) || {};
        if (checked && value) {
          emitResolve();
          return;
        }
      }
      modalHandle = confirmHandler({
        ...other,
        cancelText: confirmCacheKey
          ? [<CacheCheck localKey={confirmCacheKey} />, cancelText]
          : cancelText,
        onOk: () => withAsyncOr(onOk?.()).then(emitResolve),
        onCancel: () =>
          withAsyncOr(onCancel?.()).then((e) => {
            console.log("onCancel", e);
            emitReject();
          }),
        onClose: () =>
          withAsyncOr(onClose?.()).then((e) => {
            console.log("onClose", e);
            emitReject();
          }),
      } as ModalOptions);
    }) as AsyncModalAction<ConfirmOptions, boolean>;
    if (modalHandle) Object.assign(actions, modalHandle);
    /** 外部手动输出结果 */
    actions.emit = (result: boolean) => {
      emit(result);
      modalHandle.destroy();
    };
    return actions;
  }

  function confirm(
    config: ConfirmOptions,
    confirmHandler: AdapterCaller<ModalOptions & IModalMethodsOptions> = modal.confirm!
  ) {
    let {
      dangerous,
      timeout = 0,
      timeoutResult = false,
      iconType = dangerous ? "error" : "confirm",
      title = "提示",
      okText = "确认",
      okType = dangerous ? "danger" : "primary",
      cancelButtonProps,
      cancelText = "取消",
      autoFocusButton = dangerous ? "cancel" : "ok",
      maskClosable = false,
      confirmCacheKey,
      ...other
    } = config;
    const enableTimeout = typeof timeout === "number" && timeout > 0;
    const props = {
      dangerous,
      timeout,
      timeoutResult,
      iconType,
      title,
      okText,
      okType,
      cancelText,
      cancelButtonProps: dangerous
        ? defaults({}, cancelButtonProps, {
            props: { type: "danger", ghost: true },
          })
        : cancelButtonProps,
      autoFocusButton,
      maskClosable,
      confirmCacheKey,
      ...other,
    } as ConfirmOptions;

    const handler = _confirm(props, confirmHandler);

    if (enableTimeout) {
      const propsKey = timeoutResult ? "okText" : "cancelText";
      const textButton = props[propsKey];
      let flag: any;
      const refreshText = (num: number = timeout) => {
        try {
          let text = textButton;
          if (num) {
            flag = setTimeout(() => {
              refreshText(--num);
              if (num === 0) {
                handler.emit(timeoutResult);
              }
            }, 1000);
            text = `${textButton} (${num})`;
          }
          handler?.update({ [propsKey]: text } as Partial<ConfirmOptions>);
        } catch (error) {
          clearTimeout(flag);
        }
      };
      refreshText();
    }
    return handler;
  }

  function alert(
    config: AlertOptions,
    timeout?: number,
    confirmHandler = (config.iconType !== "confirm" && modal[config.iconType as ModalType]) ||
      modal.alert
  ) {
    const options = {
      ...config,
      timeout,
      autoFocusButton: "ok",
      timeoutResult: true,
    } as ConfirmOptions;
    return confirm(options, confirmHandler) as unknown as AsyncModalAction<AlertOptions, boolean>;
  }
  return {
    modal,
    confirm,
    alert,
  };
}

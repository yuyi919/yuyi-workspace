/* eslint-disable no-empty */
/* eslint-disable no-async-promise-executor */
import Types from "@yuyi919/shared-types";
import { isEsModuleWithDefaultExport } from "@yuyi919/shared-types";
import { castComputed, castObject, expect$ } from "@yuyi919/shared-utils";
import { cloneDeep, defaults, defaultsDeep, merge } from "lodash";
import Vue, { VNode, VNodeChildren, VueConstructor } from "vue";
import { getCurrentInstance } from "vue-demi";
import { isVueComponent, VueComponent2 } from "@antv-plus2/helper";
import type { ConfirmOptions } from "./confirm";
import { IModalAction, InnerModalContext } from "./context";
import { createProtalModal, IPortalModalOptions } from "./portal";

export type RendererOrCallback<T extends VueConstructor = VueConstructor> =
  Types.OrDynamicImportCallback<T | VNodeChildren | JSX.Element>;
async function loadComponent<T extends VueConstructor>(target?: RendererOrCallback<T>): Promise<T> {
  // 如果是vue组件，直接返回
  if (isVueComponent(target)) {
    return target as T;
  }
  if (target instanceof Promise) {
    return loadComponent(await target);
  }
  if (typeof target === "function") {
    const loadResult = await target();
    return loadComponent(
      isEsModuleWithDefaultExport<T>(loadResult) ? loadResult.default : loadResult
    );
  }
  // 如果不为Function
  if (typeof target === "string") {
    target = <div domPropsInnerHTML={target.split("\n").join("<br/>")}></div>;
  }
  return {
    methods: {
      handleSubmit() {
        console.log("mock handleSubmit");
      }
    },
    render() {
      return <div>{target}</div>;
    }
  } as unknown as T;
}

function getContentLoader<P extends ICommonModalProps<any>>(
  props: P,
  renderer?: RendererOrCallback
) {
  let instance: Vue;
  const content = () =>
    new Promise<() => VNode>(async (resolve) => {
      const { handleOnClose, forceUpdate, loadData, ...other } = props;
      let Render = await loadComponent(renderer);
      if (Render) {
        Render = {
          extends: Render,
          setup() {
            const innerModal = InnerModalContext.inject();
            instance = getCurrentInstance()!.proxy;
            return {
              getInnerModal() {
                return innerModal.value;
              }
            };
          }
        } as any;
        resolve(
          Render &&
            (() => (
              <Render
                {...{
                  props: props,
                  attrs: other,
                  on: {
                    close: handleOnClose!,
                    update: forceUpdate!
                  }
                }}
              />
            ))
        );
      }
    });
  return {
    content,
    getRef<SubmitData>(): CommonModalHandler<SubmitData> {
      return instance as any;
    }
  };
}
export interface ICustomModalProps<
  Key extends keyof ModalOptionsConfig = string,
  SubmitData = any,
  LoadData = any
> extends Omit<IPortalModalOptions, "content"> {
  /**
   * 仅作为打开/关闭钩子，完全由组件内部定义如何展示
   * @default false
   */
  cycleOnly?: boolean;
  /**
   * 用props代替
   * @deprecated
   */
  formProps?: ModalOptionsConfig[Key];
  /**
   * 模态框展示组件的props
   */
  props?: ModalOptionsConfig[Key];
  /**
   * 点击确认时弹出确认对话框
   * @default false
   */
  confirmSubmit?: boolean | string | ConfirmOptions;
  /**
   * 点击取消时弹出确认对话框
   * @default false
   */
  confirmCancel?: boolean | string | ConfirmOptions;
  /**
   * 点击确认时弹出确认对话框
   * @default false
   */
  confirmClose?: boolean | string | ConfirmOptions;
  /**
   * 是否可提交
   * @default 默认自动判断[submitData!==false]
   */
  isSubmit?: boolean;
  loadData?(): LoadData | Promise<LoadData>;
  submitData?: false | ((args?: any) => SubmitData | Promise<SubmitData>);
  content?: RendererOrCallback;

  onOk?: () => any;
  onCancel?: () => any;
  onClose?: () => any;
}
export type TModalConfig<K extends string = string> = Partial<ICustomModalProps> | K;

function normlizeModalProps(
  props: TModalConfig,
  argRender?: RendererOrCallback,
  paramLoadData?: any,
  paramSubmitData?: any
): Partial<ICustomModalProps> {
  const cast = castObject(props, "title");
  const { content = argRender, submitData = paramSubmitData, loadData = paramLoadData } = cast;
  return defaults(props, {
    submitData,
    loadData,
    content
  });
}

function convertModalProps(props: Partial<ICustomModalProps>) {
  const { isSubmit = props.submitData !== false, ...other } = props;
  const base = defaults(other, {
    okText: "确认",
    cancelText: isSubmit ? "取消" : "关闭",
    width: "auto",
    formProps: {},
    closable: true,
    maskClosable: true,
    confirmSubmit: false,
    confirmCancel: false,
    confirmClose: false
  });
  const { confirmSubmit, confirmCancel, confirmClose } = base;
  return Object.assign(base, {
    isSubmit,
    confirmSubmit: getConfirmOption(confirmSubmit, "确认提交", base.placement),
    confirmClose: getConfirmOption(confirmClose, "确认关闭", base.placement),
    confirmCancel: getConfirmOption(confirmCancel, "确认" + base.cancelText, base.placement)
  });
}
function getConfirmOption(
  confirm: any,
  defaultText: string,
  placement?: any
): ConfirmOptions | false {
  return confirm !== false
    ? ((expect$.is.obj.filter(confirm) || {
        title: "提示",
        // placement,
        // getContainer: false,
        content: expect$.is.str.filter(confirm) || defaultText
      }) as ConfirmOptions)
    : false;
}

export interface ICommonModalProps<LoadData extends any = any> {
  loadData?: () => LoadData | Promise<LoadData>;
  // submitData?: false | ((args?: any) => SubmitData | Promise<SubmitData>);
  handleOnClose?: (...args: any[]) => void;
  forceUpdate?: (props: Partial<ICustomModalProps>) => void;
}

export type SubmitModalComponent<
  LoadData,
  SubmitData,
  RawBindings extends {
    handleSubmit(...args: any[]): Promise<unknown> | unknown;
  } = {
    handleSubmit(): Promise<SubmitData> | SubmitData;
  }
> = VueComponent2<ICommonModalProps<LoadData>, {}, {}, RawBindings>;
export type LoaderModalComponent<LoadData, RawBindings extends {} = {}> = VueComponent2<
  ICommonModalProps<LoadData>,
  {},
  {},
  RawBindings
>;
export interface CommonModalHandler<SubmitData> {
  loadData?<T>(): T | Promise<T>;
  handleSubmit(validate?: boolean): Promise<SubmitData>;
}
export type BaseStaticOptions = typeof staticOptions;
const staticOptions: Record<string, any> = {
  empty() {
    return {
      render(): any {
        return null;
      }
    };
  }
};
export interface ModalOptionsConfig extends BaseStaticOptions {}

export interface IModalManager {
  /**
   * 动态呼出模态框
   * @param props
   * @param argRender
   */
  callModal<SubmitData = any, LoadData = any>(
    props: TModalConfig,
    argRender: any
  ): Promise<SubmitData>;
  /**
   * 动态呼出模态框
   * @param props
   * @param argRender
   * @param argLoadData
   * @param argSubmitData
   */
  callModal<SubmitData = any, LoadData = any>(
    props: TModalConfig,
    argRender: any,
    argLoadData?: (args?: any) => LoadData | Promise<LoadData>,
    argSubmitData?: false | ((args?: any) => Promise<SubmitData>)
  ): Promise<SubmitData>;
}

class ModalEvent {
  constructor(public type: "cancel" | "close") {}
}

let rootModalCaller: ModalManager;
export class ModalManager implements IModalManager {
  static normalProps = {
    okButtonProps: {},
    cancelButtonProps: {}
  };
  static spinningProps = {
    okButtonProps: {},
    cancelButtonProps: {}
  };
  static viewProps = merge(cloneDeep(ModalManager.normalProps), {
    okButtonProps: { style: { display: "none" } }
  });
  static staticOptions = staticOptions;

  /**
   * 注册动态组件的静态预设
   * @param key
   * @param render
   * @param defaultConfig
   */
  static registerStaticModal<Key extends keyof ModalOptionsConfig, T>(
    key: Key,
    render: T | (() => Promise<{ default: T }>),
    defaultConfig?: Partial<ICustomModalProps<Key>> | ((param: any) => ICustomModalProps<Key>)
  ) {
    // @ts-ignore
    staticOptions[key] = (props: Partial<ICustomModalProps>) => {
      return [render, defaultConfig instanceof Function ? defaultConfig(props) : defaultConfig];
    };
  }

  /**
   * 根据预设的配置动态呼叫模态框
   * @param type
   * @param props
   * @param loadData
   * @param submitData
   */
  async callModalWith(
    type: keyof ModalOptionsConfig,
    props: TModalConfig,
    loadData?: (args?: any) => any | Promise<any>,
    submitData?: false | ((args?: any) => Promise<any>)
  ) {
    const [render, defaultProps] = castComputed(ModalManager.staticOptions[type], props);
    return this.callModal(Object.assign({}, defaultProps, props), render, loadData, submitData);
  }

  root: Vue | null = null;

  constructor(root?: Vue) {
    this.root = root || new Vue({});
    rootModalCaller = this;
  }

  visible: boolean = false;

  // protected get $createElement() {
  //   return this.root?.$createElement || h;
  // }

  private setVisible(visible: boolean) {
    if (this.visible !== visible) {
      this.visible = visible;
    }
  }

  callViewModal<SubmitData = any, LoadData = any>(
    props: TModalConfig,
    render: any,
    loadData?: (args?: any) => LoadData | Promise<LoadData>
  ): Promise<SubmitData | undefined> & IModalAction<ICustomModalProps> {
    return this.callModal(props, render, loadData);
  }

  callModal<SubmitData = any, LoadData = any>(
    props: TModalConfig,
    renderer?: RendererOrCallback
  ): Promise<SubmitData | undefined> & IModalAction<ICustomModalProps>;

  /**
   *
   * 此方法重载已废弃
   * @deprecated
   */
  callModal<SubmitData = any, LoadData = any>(
    props: TModalConfig,
    renderer?: RendererOrCallback,
    loadData?: (args?: any) => LoadData | Promise<LoadData>,
    submit?: false | ((args?: any) => Promise<SubmitData>)
  ): Promise<SubmitData | undefined> & IModalAction<ICustomModalProps>;
  callModal<SubmitData = any, LoadData = any>(
    props: TModalConfig,
    renderer?: RendererOrCallback,
    loadData?: (args?: any) => LoadData | Promise<LoadData>,
    submit?: false | ((args?: any) => Promise<SubmitData>)
  ): Promise<SubmitData | undefined> & IModalAction<ICustomModalProps> {
    const modalProps = normlizeModalProps(props, renderer, loadData, submit);
    const handle = {} as IModalAction<ICustomModalProps>;
    const todo = this._callModalWith<SubmitData, LoadData>(modalProps, handle);
    return Object.assign(todo, handle) as Promise<SubmitData | undefined> &
      IModalAction<ICustomModalProps>;
  }

  public async confirm(...args: Types.Function.ExtractArgs<typeof import("./confirm").confirm>) {
    const { confirm } = await import("./confirm");
    return confirm(...args);
  }

  public async alert(...args: Types.Function.ExtractArgs<typeof import("./confirm").alert>) {
    const { alert } = await import("./confirm");
    return alert(...args);
  }

  private convertOptions<SubmitData>(
    props: Partial<ICustomModalProps>,
    context: { modal: IModalAction; resolve: (emit: any) => void; reject: (emit: any) => void }
  ) {
    const { normalProps, spinningProps, viewProps } = ModalManager;
    const {
      isSubmit,
      confirmSubmit,
      confirmCancel,
      confirmClose,
      formProps,
      loadData,
      submitData,
      okText,
      cancelText,
      parentContext = this.root,
      width,
      content,
      title,
      ...other
    } = convertModalProps(props);
    const buttonProps = cloneDeep(
      defaultsDeep(
        isSubmit
          ? {
              okButtonProps: other.okButtonProps,
              cancelButtonProps: other.cancelButtonProps
            }
          : { cancelButtonProps: other.cancelButtonProps },
        isSubmit ? normalProps : viewProps
      )
    );

    const contentLoader = getContentLoader<ICommonModalProps<SubmitData>>(
      {
        loadData:
          loadData &&
          (async () => {
            try {
              // modal?.update({ loading: true });
              const loaded = await loadData();
              return loaded;
            } catch (error) {
            } finally {
              // modal?.update({ loading: false });
            }
          }),
        submitData,
        handleOnClose: () => context.modal.close(),
        forceUpdate(props) {
          // console.log(modal)
          context.modal?.update(props);
        },
        ...formProps
      },
      content
    );
    const config: IPortalModalOptions = {
      ...buttonProps,
      ...other,
      cancelText,
      okText,
      title,
      content: contentLoader.content,
      width,
      onOk: async (doClose) => {
        try {
          if (confirmSubmit && (await this.confirm(confirmSubmit)) === false) return;
          const data = (await contentLoader.getRef<SubmitData>().handleSubmit?.()) ?? {};
          console.log("submitData", data);
          const next = typeof submitData === "function" ? await submitData(data) : data;
          const handle = other.onOk?.();
          if (handle instanceof Promise) await handle;
          context.resolve(next), doClose && doClose();
        } catch (error) {
          console.error(error);
        }
      },
      onCancel: async (doClose) => {
        if (isSubmit && confirmCancel && !(await this.confirm(confirmCancel))) return;
        const handle = other.onCancel?.();
        if (handle instanceof Promise) await handle;
        return context.reject(new ModalEvent("cancel")), doClose && doClose();
      },
      onClose: async (doClose) => {
        if (
          isSubmit &&
          confirmClose &&
          !(await this.confirm({ ...(confirmClose as any), parentModal: contentLoader.getRef() }))
        )
          return;
        const handle = other.onClose?.();
        if (handle instanceof Promise) await handle;
        // contentLoader.getRef<SubmitData>().$destroy();
        return context.reject(new ModalEvent("close")), doClose && doClose();
      }
    };
    // console.log("new config", config, formProps);
    return config;
  }

  async _callModalWith<SubmitData = any, LoadData = any>(
    props: Partial<ICustomModalProps>,
    handler: IModalAction<ICustomModalProps>
  ): Promise<SubmitData | undefined> {
    this.setVisible(true);
    let watchEnd: any;
    try {
      const { parentContext = this.root } = props;
      if (!parentContext) throw Error("需要设置root!");
      const result = await new Promise<SubmitData>(async (resolve, reject) => {
        /**路由变更的时候关闭弹出(临时做法) */
        watchEnd = parentContext.$watch(
          // @ts-ignore
          () => parentContext.$route?.path,
          () => {
            context._modal?.close();
          }
        );
        const context = {
          _modal: null as unknown as IModalAction,
          get modal() {
            return context._modal;
          },
          resolve,
          reject
        };
        context._modal = createProtalModal(
          this.convertOptions<SubmitData>(props, context),
          parentContext
        );
        Object.assign(handler, {
          ...context._modal,
          update: (updateConfig: ICustomModalProps) => {
            context._modal.update(
              this.convertOptions<SubmitData>(defaultsDeep(updateConfig, props), context)
            );
          },
          close() {
            context._modal.close();
            reject(new ModalEvent("close"));
          }
        });
      });
      this.setVisible(false);
      return result;
    } catch (e) {
      // debugger
      if (e instanceof ModalEvent) {
        // $logger.debug(e);
      } else {
        // $logger.error(e);
        throw e;
      }
    } finally {
      if (watchEnd) {
        watchEnd && watchEnd();
        watchEnd = null;
      }
    }
  }

  static getInstance(root?: Vue) {
    if (root) {
      return new ModalManager(root);
    }
    if (!rootModalCaller) throw Error("尚未注册[ModalManager]实例");
    return rootModalCaller;
  }
}

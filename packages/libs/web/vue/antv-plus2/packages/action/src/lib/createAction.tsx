import { defineComponent } from "vue-demi";
import { expect$, sleep, stubFunction } from "@yuyi919/shared-utils";
import { extractProps, TypedPropsGroup } from "@antv-plus2/helper";
import { Popconfirm } from "ant-design-vue";
import AutoOperationBar from "./component";
import { IConfirmButtonProps } from "./interface";
import { Antv } from "../shared";

export const StaticProps = {
  okButtonProps: { style: "display: none" },
  cancelButtonProps: { style: "display: none" },
};

export function createConfirmButton(initialConfirm: any) {
  return defineComponent<any, any, any, any, any>({
    functional: true,
    render(
      _,
      {
        props: {
          getContainer = null,
          loading = false,
          disabled = undefined,
          confirm = initialConfirm,
          okText = "确认",
          cancelText = "取消",
        } = {} as IConfirmButtonProps,
        data,
        children,
        listeners = {},
      }: any
    ) {
      const isDisabled = expect$.is.bool.filter(disabled, confirm === undefined);
      // console.log(data, listeners, isDisabled);
      listeners.click = listeners.click || stubFunction;
      return (
        <Popconfirm
          {...data}
          arrowPointAtCenter
          getPopupContainer={() => document.body}
          title={<a-spin spinning={loading}>{confirm}</a-spin>}
          onConfirm={listeners.click}
          okText={okText}
          props={{
            okButtonProps: { props: { loading } },
            cancelButtonProps: loading ? StaticProps.cancelButtonProps : {},
            ...(isDisabled ? { visible: false } : {}),
          }}
          cancelText={cancelText}
        >
          {children}
        </Popconfirm>
      );
    },
  });
}

export function createConfirmButtonComponent(initialConfirm: any) {
  return defineComponent({
    functional: true,
    props: extractProps(Antv.AntPopconfirmProps) as TypedPropsGroup<
      InstanceType<typeof Antv.AntPopconfirmProps>
    >,
    render(
      h,
      {
        props: {
          getContainer = null,
          disabled = undefined,
          confirm = initialConfirm,
          okText = "确认",
          cancelText = "取消",
        } = {} as any,
        data,
        children,
        listeners = {} as any,
      }
    ) {
      // console.log(data, listeners);
      return (
        <Popconfirm
          {...data}
          {...{ props: StaticProps }}
          getPopupContainer={getContainer}
          disabled={expect$.is.bool.filter(disabled, confirm === undefined)}
          title={
            <AutoOperationBar
              primary="ok"
              defaultProps={{ size: "small" }}
              defaultActionHandler={{
                ok: async (...args: any[]) => {
                  console.log(args);
                  await sleep(10000);
                },
              }}
              style={{ marginBottom: "-12px", marginTop: "12px" }}
              actions={{
                cancel: cancelText,
                ok: okText,
              }}
            >
              <template slot="content">{confirm}</template>
            </AutoOperationBar>
          }
          onConfirm={listeners.click || (() => {})}
        >
          {children}
        </Popconfirm>
      );
    },
  });
}

export const ConfirmDeleteButton = createConfirmButton("确认要删除？");
export const ConfirmAddButton = createConfirmButton("确认要新增？");
export const ConfirmEditButton = createConfirmButton("确认要修改？");
export const ConfirmCancelButton = createConfirmButton("确认取消操作？");

export const CommonConfirmButton = {
  delete: ConfirmDeleteButton,
  add: ConfirmAddButton,
  edit: ConfirmEditButton,
  cancel: ConfirmCancelButton,
};

export function getConfirmContainerComponent<K extends keyof typeof CommonConfirmButton>(
  config: K
): typeof CommonConfirmButton[K];
export function getConfirmContainerComponent(config: any): ReturnType<typeof createConfirmButton>;
export function getConfirmContainerComponent(config: any) {
  return (
    CommonConfirmButton[config as keyof typeof CommonConfirmButton] || createConfirmButton(config)
  );
}

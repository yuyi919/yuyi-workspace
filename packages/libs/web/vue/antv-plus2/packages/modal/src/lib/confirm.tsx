import { Icon } from "ant-design-vue";
import { configureModalAdapter, ConfirmOptionAdapter, AlertOptionsAdapter } from "./utils";
import { watch } from "vue-demi";
import { useModalAction } from "./context";
import { ModalManager, ICustomModalProps } from "./Manager";
import { defineLoaderModalComponent } from "./Resolve";
import { unwrap, useLoaderInstance } from "@yuyi919/vue-use";

export type ConfirmOptions = ConfirmOptionAdapter<ICustomModalProps>;
export type AlertOptions = AlertOptionsAdapter<
  ICustomModalProps,
  "confirm" | "warning" | "warn" | "success" | "info" | "error"
>;

export const { confirm, alert } = configureModalAdapter<
  ICustomModalProps,
  "confirm" | "warning" | "warn" | "success" | "info" | "error"
>({
  confirm(config) {
    const { title, content, iconType, icon = iconType, width = 416, ...options } = config;
    const modal = ModalManager.getInstance(options.parentContext);
    const ins = modal.callModal(
      {
        ...options,
        width,
        footerBorder: false,
        formProps: {
          title,
          icon,
          content,
        },
        classNames: {
          root: `ant-modal-confirm ant-modal-confirm-${
            classNames[iconType!] || classNames.confirm
          }`,
        },
      },
      ConfirmModal
    );
    const tmp = ins.update;
    return Object.assign(ins, {
      update({ title, content, iconType, icon = iconType, ...other }: ConfirmOptions) {
        return tmp({
          ...other,
          formProps: {
            title,
            icon,
            content,
          },
        });
      },
    });
  },
  alert(config) {
    let { title, content, iconType, icon = iconType, width = 416, ...options } = config;
    if (icon && icon instanceof Object) {
      iconType ??= "info";
    }
    const modal = ModalManager.getInstance(options.parentContext);
    const ins = modal.callModal(
      {
        ...options,
        width,
        footerBorder: false,
        formProps: {
          title,
          icon,
          content,
        },
        cancelButtonProps: { style: { display: "none" } },
        classNames: {
          root: `ant-modal-confirm ant-modal-confirm-${classNames[iconType!] || classNames.info}`,
        },
      },
      ConfirmModal
    );
    const tmp = ins.update;
    return Object.assign(ins, {
      update({ title, content, iconType, icon = iconType, ...other }: ConfirmOptions) {
        return tmp({
          ...other,
          formProps: {
            title,
            icon,
            content,
          },
        });
      },
    });
  },
});

const classNames: Record<string, string> = {
  warn: "warning",
  warning: "warning",
  success: "success",
  info: "info",
  error: "error",
  confirm: "confirm",
};

const ConfirmModal = defineLoaderModalComponent({
  props: {
    content: null,
    icon: null,
    title: null,
  },
  setup(props) {
    const renderer = useLoaderInstance(() => unwrap(props.content as any));
    watch(
      () => props.content,
      async () => {
        await renderer.load();
        actions.update({ formProps: { loading: false } });
      },
      { immediate: true }
    );
    const actions = useModalAction();
    return {
      renderer,
    };
  },
}).render((self) => {
  const iconType = getIcon<any>(self.icon);
  return (
    <div class="ant-modal-confirm-body-wrapper">
      <div data-icon-type={self.icon} class="ant-modal-confirm-body">
        {typeof iconType === "string" ? (
          <Icon type={iconType} class="ant-modal-confirm-icon" />
        ) : (
          <span class="ant-modal-confirm-icon">{iconType}</span>
        )}
        <span
          class="ant-modal-confirm-title"
          style={{
            display: "inline-block",
          }}
        >
          {self.title}
        </span>
        <div class="ant-modal-confirm-content">
          <a-skeleton paragraph={{ rows: 1 }} title={false} active loading={self.renderer.loading}>
            {self.renderer.data}
          </a-skeleton>
        </div>
      </div>
    </div>
  );
});
function getIcon(iconType: "confirm" | "warning" | "warn" | "success" | "info" | "error"): string;
function getIcon<T>(iconType: T): T;
function getIcon(
  icon: "confirm" | "warning" | "warn" | "success" | "info" | "error"
): JSX.Element | string {
  if (typeof icon !== "string") return icon;
  if (icon === "confirm") {
    return "question-circle";
  } else if (icon === "warning" || icon === "warn") {
    return "info-circle";
  } else if (icon === "success") {
    return "check-circle";
  } else if (icon === "info") {
    return "exclamation-circle";
  } else if (icon === "error") {
    return "close-circle";
  } else {
    return icon;
  }
}
// confirm({
//   autoFocusButton: ""
// })

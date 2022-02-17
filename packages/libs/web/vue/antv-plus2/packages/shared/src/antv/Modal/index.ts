/* eslint-disable no-redeclare */
import { Modal as AntModal } from "ant-design-vue";
import { getPropsClass, TypeTsxProps } from "@antv-plus2/helper";
import { CSSProperties, Types } from "@yuyi919/shared-types";

declare module "ant-design-vue/types/ant-design-vue.d" {
  export interface IModalProps {
    /**
     * Specify a function that will be called when modal is closed completely.
     * @type Function
     */
    afterClose?: () => any;

    /**
     * Body style for modal body element. Such as height, padding etc.
     * @default {}
     * @type object
     */
    bodyStyle?: string | CSSProperties;

    /**
     * Text of the Cancel button
     * @default 'cancel'
     * @type string
     */
    cancelText?: string;

    /**
     * Centered Modal
     * @default false
     * @type boolean
     */
    centered?: boolean;

    /**
     * Whether a close (x) button is visible on top right of the modal dialog or not
     * @default true
     * @type boolean
     */
    closable?: boolean;

    closeIcon?: any;

    /**
     * Whether to apply loading visual effect for OK button or not
     * @default false
     * @type boolean
     */
    confirmLoading?: boolean;

    /**
     * Whether to unmount child components on onClose
     * @default false
     * @type boolean
     */
    destroyOnClose?: boolean;

    /**
     * Footer content, set as :footer="null" when you don't need default buttons
     * @default OK and Cancel buttons
     * @type any (string | slot)
     */
    footer?: any;

    /**
     * Return the mount node for Modal
     * @default () => document.body
     * @type Function
     */
    getContainer?: (instance?: any) => HTMLElement;

    /**
     * Whether show mask or not.
     * @default true
     * @type boolean
     */
    mask?: boolean;

    /**
     * Whether to close the modal dialog when the mask (area outside the modal) is clicked
     * @default true
     * @type boolean
     */
    maskClosable?: boolean;

    /**
     * Style for modal's mask element.
     * @default {}
     * @type object
     */
    maskStyle?: string | CSSProperties;

    /**
     * Text of the OK button
     * @default 'OK'
     * @type string
     */
    okText?: string;

    /**
     * Button type of the OK button
     * @default 'primary'
     * @type string
     */
    okType?: "primary" | "danger" | "dashed" | "ghost" | "default";

    /**
     * The ok button props, follow jsx rules
     * @type object
     */
    okButtonProps?: Record<string, any>;

    /**
     * The cancel button props, follow jsx rules
     * @type object
     */
    cancelButtonProps?: Record<string, any>;

    /**
     * The modal dialog's title
     * @type any (string | slot)
     */
    title?: any;

    /**
     * Whether the modal dialog is visible or not
     * @default false
     * @type boolean
     */
    visible?: boolean;

    /**
     * Width of the modal dialog
     * @default 520
     * @type string | number
     */
    width?: string | number;

    /**
     * The class name of the container of the modal dialog
     * @type string
     */
    wrapClassName?: string;

    /**
     * The z-index of the Modal
     * @default 1000
     * @type number
     */
    zIndex?: number;
    /**
     * antd缺失的定义，
     */
    transitionName?: string;
  }
  export interface IModalEvents {
    cancel?: MouseEvent;
    ok?: MouseEvent;
  }
  export interface IModalScopedSlots {}
  export interface IModalPublicMembers {}
  interface Modal extends IModalPublicMembers {
    $props: TypeTsxProps<IModalProps, IModalEvents>;
  }
}

export const ModalProps = getPropsClass(AntModal, {
  destroyOnClose: true,
});
export { AntModal };

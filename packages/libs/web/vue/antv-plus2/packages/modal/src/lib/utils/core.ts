import { ModalOptions as AntModalOptions } from "ant-design-vue/types/modal";

export type ModalOptions = AntModalOptions;
export type ModalConfirm<T = ModalOptions> = {
  /**
   * Updates modal options
   * @param modalOptions modal option
   */
  update(modalOptions: Partial<T>): void;

  /**
   * Destroy the current model instace
   */
  destroy(): void;
};
export const Modal: Record<DialogType, (options: ModalOptions) => ModalConfirm<ModalOptions>> = {
  info: null,
  success: null,
  error: null,
  warning: null,
  confirm: null,
  loading: null,
} as any;
export type DialogType = "info" | "success" | "error" | "warning" | "confirm" | "loading";

export const Message: Record<
  DialogType,
  (content: any, duration?: number, onClose?: () => void) => Promise<any>
> & {
  destroy: () => void;
} = {
  success: null,
  warning: null,
  info: null,
  error: null,
  loading: null,
  destroy: null,
} as any;

export function registerCoreModal(modal: typeof Modal) {
  for (const key in Modal) {
    Modal[key as DialogType] = modal[key as DialogType];
  }
}
export function registerModalCaller<K extends keyof typeof Modal>(type: K, modal: typeof Modal[K]) {
  return (Modal[type] = modal);
}

export function registerCoreMessage(message: typeof Message) {
  for (const key in Modal) {
    Message[key as DialogType] = message[key as DialogType];
  }
}

// @ts-ignore
// window.Modal = Modal;
// @ts-ignore
// window.Message = Message;

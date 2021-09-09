import { createContext } from "@yuyi919/vue-use";
import { ICustomModalProps } from "./Manager";
import { IPortalModalOptions } from "./portal";

export const ModalContext = createContext<IModalAction<ICustomModalProps>>("__Modal");
export function useModalAction() {
  return ModalContext.inject();
}
export type DynamicModalOptions = Omit<IPortalModalOptions, "content">;
export interface IModalAction<Options extends DynamicModalOptions = DynamicModalOptions> {
  /**
   * Updates modal options
   * @param modalOptions modal option
   */
  update(modalOptions: Options): void;
  /**
   * Destroy the current model instace
   */
  destroy(): void;
  /**
   * Close and Destroy the current model instace
   */
  close(): void;
}

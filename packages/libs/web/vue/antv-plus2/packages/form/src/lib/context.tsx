import { computed, ComputedRef } from "vue-demi";
import { createContext } from "@yuyi919/vue-use";
import { FormLayoutProps } from "./FormLayoutProps";

export const FormLayoutDeepContext =
  createContext<ComputedRef<FormLayoutProps | undefined>>("FormLayoutDeepContext");

export const FormLayoutShallowContext = createContext<ComputedRef<FormLayoutProps | undefined>>(
  "FormLayoutShallowContext"
);

export const useFormDeepLayout = () => FormLayoutDeepContext.inject();

export const useFormShallowLayout = () => FormLayoutShallowContext.inject();

export const useFormLayout = () => {
  const deep = useFormDeepLayout();
  const shallow = useFormShallowLayout();
  return computed(
    () =>
      ({
        ...(deep?.value || {}),
        ...(shallow?.value || {}),
      } as FormLayoutProps)
  );
};

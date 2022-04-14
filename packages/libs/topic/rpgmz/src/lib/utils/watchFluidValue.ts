import {
  addFluidObserver,
  FluidValue,
  getFluidValue,
  removeFluidObserver
} from "@react-spring/shared";

export function watchFluidValue<
  V extends FluidValue,
  Args extends V extends FluidValue<infer T, infer E> ? [value: T, event: E] : [value: unknown]
>(target: V, onChange: (...args: Args) => any) {
  if (target instanceof FluidValue) {
    const handle = addFluidObserver(target as V, (on) => {
      const next = getFluidValue(target) as Args[0];
      //@ts-ignore
      onChange(next, on);
    });
    return () => removeFluidObserver(target, handle);
  }
  return () => {};
}

import { getCurrentInstance } from "vue-demi";

export function getSlot(
  source: {
    $slots?: any;
    $scopedSlots?: any;
    slots?: any;
    scopedSlots?: any;
  },
  props?: any,
  name: string = "default",
  ...names: string[]
) {
  const { $slots, $scopedSlots, slots = () => $slots, scopedSlots = $scopedSlots } = source;
  const scopedSlotName = names.concat([name]).find((name) => scopedSlots[name]);
  // @ts-ignore
  const scopedSlot = scopedSlots[scopedSlotName];
  if (scopedSlot instanceof Function) {
    return (scopedSlot as any)(...((props instanceof Array && props) || [props]));
  }
  return slots()[name];
}

export function useSlot(name: string = "default", defaultTo?: (...props: any[]) => any) {
  const self = getCurrentInstance()!.proxy;
  return (...props: any[]) => {
    const {
      $scopedSlots: scopedSlots,
      $props: { [name]: propSlot },
    } = self;
    if (propSlot !== void 0) return propSlot;
    // @ts-ignore
    const scopedSlot = scopedSlots[name];
    const render =
      scopedSlot instanceof Function ? (scopedSlot as any).apply(self, props) : self.$slots[name];
    if (render === void 0) {
      return defaultTo && defaultTo.apply(self, props);
    }
    return render;
  };
}

import { onMounted, defineComponent } from "vue-demi";
import { useComponentEl } from "@yuyi919/vue-use";

export const LocalStorage = {
  set(key: string, value: { checked?: boolean; value?: boolean }) {
    return localStorage.setItem(key, JSON.stringify(value));
  },
  get(key: string): { checked?: boolean; value?: boolean } | undefined {
    try {
      return JSON.parse(localStorage.getItem(key) || "");
    } catch (error) {
      return void 0;
    }
  },
  delete(key: string) {
    return localStorage.removeItem(key);
  },
};

export const CacheCheck = defineComponent({
  props: {
    localKey: String,
  },
  setup(props) {
    const elRef = useComponentEl();
    onMounted(() => {
      const parent: HTMLDivElement = elRef.value?.parentElement as HTMLDivElement;
      if (parent) {
        parent.parentElement?.parentElement?.insertBefore(elRef.value, parent.parentElement);
      }
    });
    function handleChange(this: Vue, e: any) {
      if (!props.localKey) return;
      if (e?.target?.checked) {
        LocalStorage.set(props.localKey, { checked: true });
      } else LocalStorage.delete(props.localKey);
    }
    return () => {
      return <a-checkbox onChange={handleChange}>不再提示</a-checkbox>;
    };
  },
});

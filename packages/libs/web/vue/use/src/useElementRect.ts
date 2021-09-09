/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-expressions */
import { reactive, Ref, ref, watch, onBeforeUnmount } from "vue-demi";
import { addResizeListener, removeResizeListener } from "./resizeHandler";

export function useElementRect<El extends HTMLElement>(
  elRef: Ref<El | null> = ref<El | null>(null) as Ref<El>
) {
  const rect = reactive<RectConfig>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    height: 0,
    width: 0,
    y: 0,
    x: 0,
  });
  function update() {
    const next = getElementRect(elRef.value);
    for (const key in getElementRect(elRef.value)) {
      rect[key] = next[key];
    }
  }
  watch(
    elRef,
    (el, prev) => {
      if (el !== prev) {
        if (prev) removeResizeListener(prev, update);
        if (el) {
          addResizeListener(el, update, 200);
          update();
        }
      }
    },
    { immediate: true }
  );
  onBeforeUnmount(() => {
    elRef.value && removeResizeListener(elRef.value, update);
  });
  return [rect, elRef, update] as const;
}

export function getElementRect(el: HTMLElement) {
  const { top, bottom, left, right, height, width, y, x } = el.getClientRects()[0] || {};
  return { top, bottom, left, right, height, width, y, x };
}
export type RectConfig = ReturnType<typeof getElementRect>;

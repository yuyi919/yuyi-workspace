import { onUnmounted, reactive } from "vue-demi";
import { Observable, asyncScheduler, fromEvent } from "rxjs";
import { distinctUntilChanged, map, share, throttleTime } from "rxjs/operators";

let observer: Observable<{
  height: number;
  width: number;
}>;

export function useWindowSize(delayTime: number = 100) {
  if (typeof window === "undefined") return { height: void 0, width: void 0 };
  if (!observer) {
    observer = fromEvent(window, "resize").pipe(
      throttleTime(delayTime, asyncScheduler, {
        leading: true,
        trailing: true,
      }),
      map(() => ({
        height: window.innerHeight,
        width: window.innerWidth,
      })),
      distinctUntilChanged((a, b) => a.height === b.height && a.width === b.width),
      share()
    );
  }
  const windowSize = reactive({
    height: window.innerHeight,
    width: window.innerWidth,
  });
  const sub = observer.subscribe((size) => {
    requestAnimationFrame(() => {
      if (windowSize.width !== size.width) windowSize.width = size.width;
      if (windowSize.height !== size.height) windowSize.height = size.height;
    });
  });
  onUnmounted(() => {
    sub.unsubscribe();
  });
  return windowSize;
}

import { computed, ComputedRef, isReactive, onBeforeUnmount, reactive } from "vue-demi";
import { ConfigurableWindow, defaultWindow } from "./_configurable";

export class MediaQuery {
  mediaQuery: MediaQueryList | null;
  matches = false;

  constructor(query: string, public options: ConfigurableWindow = {}) {
    const { window = defaultWindow } = this.options;
    const mediaQuery = window.matchMedia(query);
    this.matches = mediaQuery.matches;
    this.mediaQuery = mediaQuery;
    if ("addEventListener" in mediaQuery) mediaQuery.addEventListener("change", this.handler);
    else (mediaQuery as MediaQueryList).addListener(this.handler);
  }

  private handler = (event: MediaQueryListEvent) => {
    this.matches = event.matches;
  };

  dispose() {
    if ("removeEventListener" in this.mediaQuery)
      this.mediaQuery.removeEventListener("change", this.handler);
    else (this.mediaQuery as MediaQueryList).removeListener(this.handler);
  }
}

/**
 * Reactive Media Query.
 *
 * @see https://vueuse.org/useMediaQuery
 * @param query -
 * @param store - MediaQueryWrapper
 */
export function useMediaQuery(query: string, store?: MediaQuery): ComputedRef<boolean>;
/**
 * Reactive Media Query.
 *
 * @see https://vueuse.org/useMediaQuery
 * @param query -
 * @param options -
 */
export function useMediaQuery(query: string, options?: ConfigurableWindow): ComputedRef<boolean>;
export function useMediaQuery(query: string, options?: MediaQuery | ConfigurableWindow) {
  const store = reactive(options instanceof MediaQuery ? options : new MediaQuery(query, options));
  onBeforeUnmount(() => store.dispose());
  return computed(() => store.matches);
}
export function useMediaQueryWith(store: MediaQuery): ComputedRef<boolean> {
  const isReacted = isReactive(store);
  store = isReacted ? store : (reactive(store) as MediaQuery);
  !isReacted && onBeforeUnmount(() => store.dispose());
  return computed(() => store.matches);
}

export function matchMediaQuery(query: string, options?: ConfigurableWindow): boolean {
  const { window = defaultWindow } = options || {};
  if (!window) return false;
  return window.matchMedia(query).matches;
}

export * from "./context";
export * from "./resizeHandler";
export * from "./useElementRect";
export * from "./std";
export * from "./state";
export * from "./useInherit";
export * from "./useLoader";
export * from "./usePageQuery";
export * from "./useWindow";
export * from "./useMediaQuery";
export * from "./useBreakPoints";
export * from "./shared";

export function useComponentLoader<T extends any, Named extends keyof T>(
  loader: () => Promise<T>,
  name: Named = "default" as Named
) {
  return (async () => {
    const r = await loader();
    return (r as { [K in Named]: T })[name] || r;
  }) as unknown as T[Named] & Promise<T[Named]>;
}

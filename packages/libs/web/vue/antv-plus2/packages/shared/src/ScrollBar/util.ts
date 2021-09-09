export const BAR_MAP = {
  vertical: {
    offset: "offsetHeight",
    scroll: "scrollTop",
    scrollSize: "scrollHeight",
    clientSize: "clientHeight",
    size: "height",
    key: "vertical",
    axis: "Y",
    client: "clientY",
    direction: "top",
  },
  horizontal: {
    offset: "offsetWidth",
    scroll: "scrollLeft",
    scrollSize: "scrollWidth",
    clientSize: "clientWidth",
    size: "width",
    key: "horizontal",
    axis: "X",
    client: "clientX",
    direction: "left",
  },
} as const;
export type BarMapValue = typeof BAR_MAP[keyof typeof BAR_MAP];

export function renderThumbStyle(
  move: number,
  size: number,
  bar: typeof BAR_MAP["vertical" | "horizontal"]
) {
  const translate = `translate${bar.axis}(${move}px)`;
  const style: any = {};

  style[bar.size] = size + "px";
  style.transform = translate;
  // style.msTransform = translate;
  // style.webkitTransform = translate;
  // console.log(style);
  return style; // `${bar.size}:${size};transform:${translate};-ms-transform:${translate};-webkit-ransform:${translate};`;
}

export { extend } from "./extend";
import { is } from "@yuyi919/shared-types";

export const getValue = (root: any, get: string) => {
  if (typeof root !== "object" || is.null(root)) return root;
  let value = root;
  const keyArr = get.split(".");
  for (let i = 0, l = keyArr.length; i < l; i++) {
    const v = keyArr[i];
    if (v) {
      value = value[v];
      if (typeof value !== "object") break;
    }
  }
  return value;
};

export function getPoint(ev: PScroller.PixiEvent) {
  return {
    t: Date.now(),
    id: ev.data.identifier,
    x: Math.round(ev.data.global.x),
    y: Math.round(ev.data.global.y),
  };
}

export const requestAnimateFrame = window.requestAnimationFrame || ((fn) => setTimeout(fn, 17));

export const loop = (fn, autoLoop: boolean = true) => {
  if (autoLoop) {
    (function _fn() {
      if (fn() !== false) {
        requestAnimateFrame(_fn);
      }
    })();
  } else {
    (function _fn() {
      fn(() => requestAnimateFrame(_fn));
    })();
  }
};

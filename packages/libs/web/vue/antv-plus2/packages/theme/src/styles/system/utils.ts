// import MuiError from '../macros/MuiError.macro';
// It should to be noted that this function isn't equivalent to `text-transform: capitalize`.
//
// A strict capitalization should uppercase the first letter of each word in the sentence.

import { MuiError } from "../../MuiError";

// We only handle the first word.
export function unstable_capitalize(string?: string) {
  if (typeof string !== "string") {
    throw new MuiError("Material-UI: `capitalize(string)` expects a string argument.");
  }

  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function isPlainObject(item?: unknown): item is Record<keyof any, unknown> {
  return (
    item !== null &&
    typeof item === "object" &&
    // TS thinks `item is possibly null` even though this was our first guard.
    (item as Record<keyof any, unknown>).constructor === Object
  );
}

export interface DeepmergeOptions {
  clone?: boolean;
}

export function deepmerge<T>(
  target: T,
  source: unknown,
  options: DeepmergeOptions = { clone: true }
): T {
  const output = options.clone ? { ...target } : target;

  if (isPlainObject(target) && isPlainObject(source)) {
    Object.keys(source).forEach((key) => {
      // Avoid prototype pollution
      if (key === "__proto__") {
        return;
      }

      if (isPlainObject(source[key]) && key in target && isPlainObject(target[key])) {
        // Since `output` is a clone of `target` and we have narrowed `target` in this block we can cast to the same type.
        (output as Record<keyof any, unknown>)[key] = deepmerge(target[key], source[key], options);
      } else {
        (output as Record<keyof any, unknown>)[key] = source[key];
      }
    });
  }

  return output;
}

export interface DeepmergeClsOptions {
  clone?: boolean;
  root?: boolean;
}
export function deepmergeCls<T extends Record<string, any>, R extends Record<string, any>>(
  target: T,
  source: R,
  options: DeepmergeClsOptions = { clone: true, root: true }
): T & R {
  const output = isPlainObject(target) && options.clone ? { ...target } : target;

  if (target && source instanceof Object) {
    source as Record<string, any>;
    Object.keys(source).forEach((key) => {
      // Avoid prototype pollution
      if (key === "__proto__") {
        return;
      }
      if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
        // Since `output` is a clone of `target` and we have narrowed `target` in this block we can cast to the same type.
        (output as Record<keyof any, unknown>)[key] = deepmergeCls(target[key], source[key], {
          ...options,
          root: false
        });
      } else {
        (output as Record<keyof any, unknown>)[key] = source[key];
      }
    });
  }

  return output as T & R;
}
export function getPath(obj: any, path?: string) {
  if (!path || typeof path !== "string") {
    return null;
  }

  return path.split(".").reduce((acc, item) => (acc && acc[item] ? acc[item] : null), obj);
}

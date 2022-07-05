/* eslint-disable guard-for-in */
declare interface KagTagPlugin<Param> {
  vital?: keyof Param | false;
  start(
    this: ITyrano,
    pm: Param
    // {
    //   [K in keyof Param]: Param[K] extends boolean
    //     ? "true" | "false" | Param[K]
    //     : Param[K] extends number
    //     ? number
    //     : Param[K];
    // }
  ): any;
}

export function defineMasterTag<Param, Handle extends KagTagPlugin<Param>>(
  name: string,
  defaultPm: Param,
  handle: Handle | (() => Handle)
) {
  const master_tag = TYRANO.kag.ftag.master_tag;
  const { start, ...define } = handle instanceof Function ? handle() : handle;
  const numberKeys = [] as string[];
  const boolKeys = [] as string[];
  for (const key in defaultPm) {
    const pmtype = typeof defaultPm[key];
    if (pmtype === "number") {
      numberKeys[numberKeys.length] = key;
    } else if (pmtype === "boolean") {
      boolKeys[boolKeys.length] = key;
    }
  }
  master_tag[name] = {
    pm: defaultPm,
    ...define,
    start(pm: any) {
      for (const key of numberKeys) {
        pm[key] = typeof pm[key] === "number" ? pm[key] : parseFloat(pm[key]);
        if (pm[key] !== pm[key]) {
          pm[key] = defaultPm[key];
        }
      }
      for (const key of boolKeys) {
        // eslint-disable-next-line no-eval
        pm[key] = typeof pm[key] === "boolean" ? pm[key] : eval(pm[key]);
        if (typeof pm[key] !== "boolean") {
          pm[key] = defaultPm[key];
        }
      }
      start.call(this, pm);
    }
  } as any;
  Object.setPrototypeOf(master_tag[name], TYRANO);
}

export abstract class TAG {
  abstract pm: any;

  abstract start(pm: this["pm"]): any;
}

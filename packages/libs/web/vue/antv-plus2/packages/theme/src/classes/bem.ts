export type Mod = string | { [key: string]: any };
export type Mods = Mod;

const ELEMENT = "__";
const MODS = "--";

function join(name: string, el?: string, symbol?: string): string {
  return el ? name + symbol + el : name;
}

function prefix(name: string, mods: string): string {
  return join(name, mods, MODS);
}

export function createBEM(name: string): (el?: string, mods?: string) => string {
  if (createBEM.cache[name]) return createBEM.cache[name];
  function getBem(el: string = "", mods?: string): string {
    const keyword = mods ? el + "|" + mods : el;
    if (getBem.cache[keyword]) return getBem.cache[keyword];
    el = join(name, el as string, ELEMENT);
    return (getBem.cache[keyword] = mods ? prefix(el, mods) : el);
  }
  getBem.cache = {} as Record<string, any>;
  return (createBEM.cache[name] = getBem);
}
createBEM.cache = {} as Record<string, any>;

export type BEM = ReturnType<typeof createBEM>;

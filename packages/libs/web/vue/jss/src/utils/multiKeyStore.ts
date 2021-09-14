// Used https://github.com/thinkloop/multi-key-cache as inspiration

export const multiKeyStore = {
  set: (cache: Map<any, any>, key1: any, key2: any, value: any): void => {
    let subCache = cache.get(key1);

    if (!subCache) {
      subCache = new Map();
      cache.set(key1, subCache);
    }
    subCache.set(key2, value);
  },
  get: <T>(cache: Map<any, any>, key1: any, key2: any): T | undefined => {
    const subCache = cache.get(key1);
    return subCache ? subCache.get(key2) : undefined;
  },
  delete: (cache: Map<any, any>, key1: any, key2: any): void => {
    const subCache = cache.get(key1);
    subCache.delete(key2);
  },
};

function copyBuffer<T extends any = any>(cur: T): T {
  if (cur instanceof Buffer) {
    return Buffer.from(cur) as T;
  }
  return new (cur as any).constructor(
    (cur as ArrayBufferView).buffer.slice(0),
    (cur as ArrayBufferView).byteOffset,
    (cur as any).length
  );
}

export const plainIteratee = <T>(target: T) => target;
export type CloneHandle<T> = (target: T) => T;

export interface Options {
  proto?: boolean;
  circles?: boolean;
}

export function cloneArray<T extends any[]>(target: T, fn?: CloneHandle<T>): T {
  const result: T = new Array(target.length) as T;
  if (Array.isArray(target)) {
    const keys = Object.keys(target);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const cur = target[key];
      result[key] = fn ? fn(cur) : cur;
    }
    return result;
  }
  for (let i = 0; i < result.length; i++) {
    const cur = target[i];
    result[i] = fn ? fn(cur) : cur;
  }
  // @ts-ignore
  return result;
}

export function cloneMapOrSet<T extends Map<any, any> | Set<any>>(
  target: T,
  iteratee?: CloneHandle<
    T extends Map<infer K, infer V> ? [K, V] : T extends Set<infer V> ? V : never
  >
): T {
  return new (target as any).constructor(
    iteratee ? cloneArray(Array.from(target), iteratee) : Array.from(target)
  ) as T;
}

export function cloneDeepWith<T extends any = any>(target: T, iteratee: CloneHandle<any>): T {
  if (target === null || typeof target !== "object") return target;
  if ((target as any).constructor?.clone instanceof Function)
    return (target.constructor as any).clone(target);
  if (target instanceof Date) return new Date(target) as T;
  const cloneDeep = (target: any) => cloneDeepWith(iteratee(target), iteratee);
  if (target instanceof Array) return cloneArray(target, cloneDeep) as T;
  if (target instanceof Map || target instanceof Set) return cloneMapOrSet(target, cloneDeep);
  if (ArrayBuffer.isView(target)) return copyBuffer(target);
  const result = {} as Record<Extract<keyof T, string>, any>;
  for (const key in target)
    Object.hasOwnProperty.call(target, key) &&
      (result[key] = cloneDeepWith(iteratee(target[key]), iteratee));
  return result as T;
}
export function cloneDeep<T extends any = any>(
  target: T,
  iteratee: CloneHandle<any> = plainIteratee
): T {
  return cloneDeepWith(target, iteratee) as T;
}

export function cloneDeepProto<T extends any = any>(target: T): T {
  if (target === null || typeof target !== "object") return target;
  if ((target as any).constructor?.clone instanceof Function)
    return (target.constructor as any).clone(target);
  if (target instanceof Date) return new Date(target) as T;
  if (target instanceof Map || target instanceof Set) return cloneMapOrSet(target, cloneDeepProto);
  if (target instanceof Array) return cloneArray(target, cloneDeepProto) as T;
  if (ArrayBuffer.isView(target)) return copyBuffer(target);
  const result = {} as Record<Extract<keyof T, string>, any>;
  for (const key in target) result[key] = cloneDeepProto(target[key]);
  return result as T;
}
export function getCloneDeep(opts?: Options) {
  opts = opts || {};
  if (opts.circles) return rfdcCircles(opts);
  return opts.proto ? cloneDeepProto : cloneDeep;
}

function rfdcCircles(opts: Options) {
  const refs = [];
  const refsNew = [];
  return opts.proto ? cloneProtoCircles : cloneCircles;

  function cloneArrayCircles<T extends any[]>(a: T, fn: (target: T) => T): T {
    const keys = Object.keys(a);
    const a2 = new Array(keys.length) as T;
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const cur = a[k];
      if (typeof cur !== "object" || cur === null) {
        a2[k] = cur;
      } else if (cur instanceof Date) {
        a2[k] = new Date(cur);
      } else if (ArrayBuffer.isView(cur)) {
        a2[k] = copyBuffer(cur);
      } else {
        const index = refs.indexOf(cur);
        if (index !== -1) {
          a2[k] = refsNew[index];
        } else {
          a2[k] = fn(cur);
        }
      }
    }
    return a2;
  }

  function cloneCircles<T extends any = any>(o: T): T {
    if (typeof o !== "object" || o === null) return o;
    if (o instanceof Date) return new Date(o) as T;
    if (Array.isArray(o)) return cloneArrayCircles(o, cloneCircles);
    if (o instanceof Map) return new Map(cloneArrayCircles(Array.from(o), cloneCircles)) as T;
    if (o instanceof Set) return new Set(cloneArrayCircles(Array.from(o), cloneCircles)) as T;
    const result = {} as Record<Extract<keyof T, string>, any>;
    refs.push(o);
    refsNew.push(result);
    for (const k in o) {
      if (Object.hasOwnProperty.call(o, k) === false) continue;
      const cur = o[k];
      if (typeof cur !== "object" || cur === null) {
        result[k] = cur;
      } else if (cur instanceof Date) {
        result[k] = new Date(cur);
      } else if (cur instanceof Map) {
        result[k] = new Map(cloneArrayCircles(Array.from(cur), cloneCircles));
      } else if (cur instanceof Set) {
        result[k] = new Set(cloneArrayCircles(Array.from(cur), cloneCircles));
      } else if (ArrayBuffer.isView(cur)) {
        result[k] = copyBuffer(cur);
      } else {
        const i = refs.indexOf(cur);
        if (i !== -1) {
          result[k] = refsNew[i];
        } else {
          result[k] = cloneCircles(cur);
        }
      }
    }
    refs.pop();
    refsNew.pop();
    return result as T;
  }

  function cloneProtoCircles<T extends any = any>(o: T): T {
    if (typeof o !== "object" || o === null) return o;
    if (o instanceof Date) return new Date(o) as T;
    if (Array.isArray(o)) return cloneArrayCircles(o, cloneProtoCircles);
    if (o instanceof Map) return new Map(cloneArrayCircles(Array.from(o), cloneProtoCircles)) as T;
    if (o instanceof Set) return new Set(cloneArrayCircles(Array.from(o), cloneProtoCircles)) as T;
    const result = {} as Record<Extract<keyof T, string>, any>;
    refs.push(o);
    refsNew.push(result);
    for (const k in o) {
      const cur = o[k];
      if (typeof cur !== "object" || cur === null) {
        result[k] = cur;
      } else if (cur instanceof Date) {
        result[k] = new Date(cur);
      } else if (cur instanceof Map) {
        result[k] = new Map(cloneArrayCircles(Array.from(cur), cloneProtoCircles));
      } else if (cur instanceof Set) {
        result[k] = new Set(cloneArrayCircles(Array.from(cur), cloneProtoCircles));
      } else if (ArrayBuffer.isView(cur)) {
        result[k] = copyBuffer(cur);
      } else {
        const i = refs.indexOf(cur);
        if (i !== -1) {
          result[k] = refsNew[i];
        } else {
          result[k] = cloneProtoCircles(cur);
        }
      }
    }
    refs.pop();
    refsNew.pop();
    return result as T;
  }
}

// const map = new Map<string, any>([['a', 1], ['b', 2], ['c', observable([
//   1, 2, 3,
//   observable([1, 2, 3,
//     observable([1, 2, 3])])
// ])], ['d', reactive([1, 2, 3, new Map<string, any>([['a', 1], ['b', 2], ['c', observable([
//   1, 2, 3,
//   observable([1, 2, 3,
//     observable([1, 2, 3])])
// ])], ['d', reactive([1, 2, 3, reactive([1, 2, 3, reactive([1, 2, 3, reactive([1, 2, 3])])])])]])])]]);
// console.log(map, cloneDeep({ map }));

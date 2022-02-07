export type R<T, Stack> = { items: (T | T[])[]; stack: Stack[] };
export type R2<T, Stack> = { items: (T | T[])[] };
export type GenerateTreeEnumContext<T, Stack> = {
  deep: number;
  stack: Stack[];
};
export type GenerateTreeEnumContextWrapper<T, Stack> = GenerateTreeEnumContext<T, Stack> & {
  indexInParent: number;
};

const cacheK = Symbol("cache");
export type CacheItem<T, Cache> = T & Cache & { source?: T; [cacheK]?: true };
export function appendCache<T, Cache>(
  target: T,
  cache: Cache
): T extends CacheItem<T, Cache> ? T : CacheItem<T, Cache> {
  return target[cacheK] === true
    ? Object.assign(target, cache)
    : ({ ...target, ...cache, source: target, [cacheK]: true } as any);
}
export function* generateTreeEnum<T extends Record<string, any>, Stack>(
  array: T[],
  matchChildren: (
    child: T,
    stack: GenerateTreeEnumContextWrapper<T, Stack>
  ) => (false | (T | T[])[])[] | false | void,
  breakChildren?: (child: T, context: GenerateTreeEnumContextWrapper<T, Stack>) => boolean,
  cache = { deep: 0, stack: [] } as GenerateTreeEnumContext<T, Stack>
) {
  let list: R2<T, Stack>[] = [{ items: [...array] }];
  // let matchd = false;
  for (let arrayItemIndex = 0; arrayItemIndex < array.length; arrayItemIndex++) {
    const item = array[arrayItemIndex];
    const context = { ...cache, indexInParent: arrayItemIndex };
    if (breakChildren && breakChildren(item, context)) {
      return;
    }
    const childrenEnums = matchChildren(item, context);
    if (childrenEnums) {
      // console.group("deep:", deep, "cursor:", arrayItemIndex, "list:", format(list));
      const appendList = [] as typeof list;
      for (const element of list) {
        let alterIndex = 0;
        for (const children of childrenEnums) {
          const generator =
            children !== false && children.length
              ? (generateTreeEnum(children, matchChildren, breakChildren, {
                  deep: cache.deep + 1,
                  stack: [...cache.stack, item],
                }) as Generator<R<T, Stack>>)
              : ([{ items: EMPTY, stack: cache.stack }] as R<T, Stack>[]);
          // console.group("nextList", "nextEnums:", format(nextEnums));
          for (const { items, stack } of generator) {
            // console.log("cursorChildren:", cursorChildren);
            if (alterIndex === 0) {
              element.items[arrayItemIndex] = (items as T[]).map(
                (item) => item && (appendCache({ ...item }, { stack: item.stack || stack }) as T)
              );
              // console.log("targetEnums replace:", cursorChildren);
            } else {
              const nextTarget = [...element.items];
              nextTarget[arrayItemIndex] = (items as T[]).map(
                (item) => item && (appendCache({ ...item }, { stack: item.stack || stack }) as T)
              );
              appendList.push({
                items: nextTarget,
              });
              // console.log("targetEnums append:", cursorChildren);
            }
            alterIndex++;
          }
          // console.groupEnd();
        }
      }
      list = list.concat(appendList);
      // console.groupEnd()
      // matchd = true;
    } else if (childrenEnums === false) {
      for (const target of list) {
        target.items[arrayItemIndex] = EMPTY as T[];
      }
    } else {
      for (const target of list) {
        target.items[arrayItemIndex] = appendCache(target.items[arrayItemIndex], {
          stack: item.stack || cache.stack,
        }) as T;
      }
    }
  }
  // matchd && console.log("list", deep, format(list));
  for (const listItem of list) {
    const items = listItem.items.flat(1) as CacheItem<T, { stack: T[] }>[];
    if (items.length > 0)
      yield {
        items: items,
        stack: cache.stack,
      };
  }
}
const EMPTY = [];
// export type Item = { children?: Item[][]; [key: string]: any };
// const inner: Item[] = [
//   { id: 3 },
//   { id: 3.5, children: [[{ id: 31 }], [{ id: 32 }]] },
//   { id: 4.5, children: [[{ id: 555 }], [{ id: 666 }]] },
// ];
// const array: Item[] = [
//   { id: 1 },
//   {
//     id: 1.5,
//     children: [inner],
//   },
//   { id: 3, children: [[{ id: 5 }], [{ id: 7 }]] },
// ];

// console.log("generateTreeEnum", format([...generateTreeEnum(array, (item) => item.children)]));
// function format(i: Item[][]) {
//   return i.map((o) =>
//     o
//       .flat(9)
//       .map((o) => o.id)
//       .join(",")
//   );
// }

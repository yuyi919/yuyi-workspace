export function* generateTreeEnum<T extends Record<string, any>>(
  array: T[],
  matchChildren: (child: T) => (false | (T | T[])[])[] | false | void,
  cache = { deep: 0 }
) {
  let list: (T | T[])[][] = [[...array]];
  // let matchd = false;
  for (let arrayItemIndex = 0; arrayItemIndex < array.length; arrayItemIndex++) {
    const item = array[arrayItemIndex];
    const childrenEnums = matchChildren(item);
    if (childrenEnums === false) {
      for (const target of list) {
        target[arrayItemIndex] = [] as T[];
      }
    } else if (childrenEnums) {
      // console.group("deep:", deep, "cursor:", arrayItemIndex, "list:", format(list));
      const appendList = [] as typeof list;
      for (const target of list) {
        let alterIndex = 0;
        for (const children of childrenEnums) {
          if (children !== false && children.length) {
            // console.group("nextList", "nextEnums:", format(nextEnums));
            for (const cursorChildren of generateTreeEnum(children, matchChildren, {
              ...cache,
              deep: cache.deep + 1,
            })) {
              // console.log("cursorChildren:", cursorChildren);
              if (alterIndex === 0) {
                target[arrayItemIndex] = cursorChildren as T[];
                // console.log("targetEnums replace:", cursorChildren);
              } else {
                const nextTarget = [...target];
                nextTarget[arrayItemIndex] = cursorChildren as T[];
                appendList.push(nextTarget);
                // console.log("targetEnums append:", cursorChildren);
              }
              alterIndex++;
            }
          } else {
            if (alterIndex === 0) {
              target[arrayItemIndex] = [] as T[];
              // console.log("targetEnums replace:", cursorChildren);
            } else {
              const nextTarget = [...target];
              nextTarget[arrayItemIndex] = [] as T[];
              appendList.push(nextTarget);
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
    }
  }
  // matchd && console.log("list", deep, format(list));
  for (const listItem of list) {
    yield listItem.flat(1);
  }
}
export type Item = { children?: Item[][]; [key: string]: any };
const inner: Item[] = [
  { id: 3 },
  { id: 3.5, children: [[{ id: 31 }], [{ id: 32 }]] },
  { id: 4.5, children: [[{ id: 555 }], [{ id: 666 }]] },
];
const array: Item[] = [
  { id: 1 },
  {
    id: 1.5,
    children: [inner],
  },
  { id: 3, children: [[{ id: 5 }], [{ id: 7 }]] },
];

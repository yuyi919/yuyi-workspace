/**
 * Makes a shallow copy of the array.
 *
 * @memberof JsExtensions
 * @returns {array} A shallow copy of the array.
 */
export function clone<T>(arr: Array<T>): Array<T> {
  return arr.slice(0);
}

// Object.defineProperty(Array.prototype, "clone", {
//   enumerable: false
// });

/**
 * Checks whether the array contains a given element.
 *
 * @memberof JsExtensions
 * @param {any} element - The element to search for.
 * @returns {boolean} True if the array contains a given element.
 * @deprecated includes() should be used instead.
 */
export function contains<T>(arr: Array<T>, element: T): boolean {
  return arr.includes(element);
}

// Object.defineProperty(Array.prototype, "contains", {
//   enumerable: false
// });

/**
 * Checks whether the two arrays are the same.
 *
 * @memberof JsExtensions
 * @param {array} array - The array to compare to.
 * @returns {boolean} True if the two arrays are the same.
 */
export function equals(arr: any, array: any): boolean {
  if (!array || arr.length !== array.length) {
    return false;
  }
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] instanceof Array && array[i] instanceof Array) {
      if (!equals(arr[i], array[i])) {
        return false;
      }
    } else if (arr[i] !== array[i]) {
      return false;
    }
  }
  return true;
}

// Object.defineProperty(Array.prototype, "equals", {
//   enumerable: false
// });

/**
 * Removes a given element from the array (in place).
 *
 * @memberof JsExtensions
 * @param {any} element - The element to remove.
 * @returns {array} The array after remove.
 */
export function remove<T>(arr: Array<T>, element: T): Array<T> {
  for (;;) {
    const index = arr.indexOf(element);
    if (index >= 0) {
      arr.splice(index, 1);
    } else {
      return arr;
    }
  }
}

// Object.defineProperty(Array.prototype, "remove", {
//   enumerable: false
// });

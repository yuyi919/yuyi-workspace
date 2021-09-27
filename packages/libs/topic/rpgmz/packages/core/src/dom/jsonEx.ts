//-----------------------------------------------------------------------------
/**
 * The static class that handles JSON with object information.
 *
 * @namespace
 */
export class JsonEx {
  /**
   * The maximum depth of objects.
   *
   * @type number
   * @default 100
   */
  static maxDepth = 100;

  /**
   * Converts an object to a JSON string with object information.
   *
   * @param {object} object - The object to be converted.
   * @returns {string} The JSON string.
   */
  static stringify(object: object): string {
    return JSON.stringify(this._encode(object, 0));
  }

  /**
   * Parses a JSON string and reconstructs the corresponding object.
   *
   * @param {string} json - The JSON string.
   * @returns {object} The reconstructed object.
   */
  static parse(json: string): object {
    return this._decode(JSON.parse(json));
  }

  /**
   * Makes a deep copy of the specified object.
   *
   * @param {object} object - The object to be copied.
   * @returns {object} The copied object.
   */
  static makeDeepCopy(object: object): object {
    return this.parse(this.stringify(object));
  }

  static _encode(value: any, depth: number): any {
    // [Note] The handling code for circular references in certain versions of
    //   MV has been removed because it was too complicated and expensive.
    if (depth >= this.maxDepth) {
      throw new Error("Object too deep");
    }
    const type = Object.prototype.toString.call(value);
    if (type === "[object Object]" || type === "[object Array]") {
      const constructorName = value.constructor.name;
      if (constructorName !== "Object" && constructorName !== "Array") {
        value["@"] = constructorName;
      }
      for (const key of Object.keys(value)) {
        value[key] = this._encode(value[key], depth + 1);
      }
    }
    return value;
  }

  static _decode(value: any): any {
    const type = Object.prototype.toString.call(value);
    if (type === "[object Object]" || type === "[object Array]") {
      if (value["@"]) {
        const constructor = window[value["@"]] as any;
        if (constructor) {
          Object.setPrototypeOf(value, constructor.prototype);
        }
      }
      for (const key of Object.keys(value)) {
        value[key] = this._decode(value[key]);
      }
    }
    return value;
  }
}

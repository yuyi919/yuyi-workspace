/* eslint-disable no-extend-native */
/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-empty-interface */
import * as ArrayHack from "./Array";
import { randomInteger } from "@yuyi919/shared-utils";

/**
 * Generates a random integer in the range (0, max-1).
 *
 * @param max - The upper boundary (excluded).
 * @returns A random integer.
 */
Math.randomInt = function (max: number) {
  return randomInteger(Math.max(max - 1, 0));
};

/**
 * Returns a number whose value is limited to the given range.
 *
 * @memberof JsExtensions
 * @param {number} min - The lower boundary.
 * @param {number} max - The upper boundary.
 * @returns {number} A number in the range (min, max).
 */
Number.prototype.clamp = function (this: number, min: number, max: number): number {
  return Math.min(Math.max(this, min), max);
};
/**
 * Returns a modulo value which is always positive.
 *
 * @memberof JsExtensions
 * @param {number} n - The divisor.
 * @returns {number} A modulo value.
 */
Number.prototype.mod = function (this: number, n: number): number {
  return ((this % n) + n) % n;
};

/**
 * Makes a number string with leading zeros.
 *
 * @memberof JsExtensions
 * @param {number} length - The length of the output string.
 * @returns {string} A string with leading zeros.
 */
Number.prototype.padZero = function (this: number, length: number): string {
  return String(this).padZero(length);
};

/**
 * Checks whether the string contains a given string.
 *
 * @memberof JsExtensions
 * @param {string} string - The string to search for.
 * @returns {boolean} True if the string contains a given string.
 * @deprecated includes() should be used instead.
 */
String.prototype.contains = function (this: string, string: string): boolean {
  return this.includes(string);
};

/**
 * Replaces %1, %2 and so on in the string to the arguments.
 *
 * @memberof JsExtensions
 * @param {any} ...args The objects to format.
 * @returns {string} A formatted string.
 */
String.prototype.format = function (this: string): string {
  return this.replace(/%([0-9]+)/g, (s, n) => arguments[Number(n) - 1]);
};

/**
 * Makes a number string with leading zeros.
 *
 * @memberof JsExtensions
 * @param {number} length - The length of the output string.
 * @returns {string} A string with leading zeros.
 */
String.prototype.padZero = function (this: string, length: number): string {
  return this.padStart(length, "0");
};

for (const key in ArrayHack) {
  //@ts-ignore
  Array.prototype[key] = function (...args) {
    //@ts-ignore
    return ArrayHack[key](this, ...args);
  };
}

console.debug("register prototype");

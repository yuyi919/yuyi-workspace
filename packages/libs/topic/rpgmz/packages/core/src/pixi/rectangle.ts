import * as PIXI from "pixi.js";
import { PIXIRectangle } from "./Extend";

//-----------------------------------------------------------------------------
/**
 * The rectangle class.
 *
 * @class
 * @extends PIXI.Rectangle
 * @param {number} x - The x coordinate for the upper-left corner.
 * @param {number} y - The y coordinate for the upper-left corner.
 * @param {number} width - The width of the rectangle.
 * @param {number} height - The height of the rectangle.
 */
export class Rectangle extends PIXIRectangle {
  constructor(x?: number, y?: number, width?: number, height?: number);
  constructor(thisClass: Constructable<Rectangle>);
  constructor(arg?: any) {
    super();
    if (arg === Rectangle) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(x?: number, y?: number, width?: number, height?: number) {
    // dup with constructor super()
    this._initialize(x, y, width, height);
  }
}

export interface RectangleLike {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export function createRectangleLike(x?: number, y?: number, width?: number, height?: number) {
  return { x, y, width, height } as RectangleLike;
}

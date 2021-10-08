import * as PIXI from "pixi.js";

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
export class Rectangle extends PIXI.Rectangle {
  constructor(x?: number, y?: number, width?: number, height?: number);
  constructor(thisClass: Constructable<Rectangle>);
  constructor(arg?: any) {
    super(...arguments);
    if (arg === Rectangle) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(x?: number, y?: number, width?: number, height?: number) {
    // dup with constructor super()
    PIXI.Rectangle.call(this, x, y, width, height);
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

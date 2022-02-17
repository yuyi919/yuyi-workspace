import { PIXIPoint } from "./Extend";

//-----------------------------------------------------------------------------
/**
 * The point class.
 *
 * @class
 * @extends PIXI.Point
 * @param {number} x - The x coordinate.
 * @param {number} y - The y coordinate.
 */
export class Point extends PIXIPoint {
  constructor(x?: number, y?: number);
  constructor(thisClass: Constructable<any>);
  constructor(arg?: any) {
    super();
    if (typeof arg === "function") {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(x?: number, y?: number): void {
    // dup with constructor super()
    super._initialize(x, y);
  }
}

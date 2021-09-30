import * as PIXI from "pixi.js";

/**
 * The window in the game.
 *
 * @class
 * @extends PIXI.Container
 */
export class WindowSuper extends PIXI.Container {
  children: WindowSuper[];
  update(): void {
    for (const child of this.children) {
      if (child.update) {
        child.update();
      }
    }
  }
}

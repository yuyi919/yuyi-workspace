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
    const { children } = this;
    for (let i = children.length; --i > -1; ) {
      children[i].update?.();
    }
  }
}

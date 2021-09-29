import * as PIXI from "pixi.js";

//-----------------------------------------------------------------------------
/**
 * The root object of the display tree.
 *
 * @class
 * @extends PIXI.Container
 */
export class Stage extends PIXI.Container {
  constructor(arg?: Constructable<Stage>) {
    super();
    if (arg !== Stage) {
      this.initialize();
    }
  }

  initialize(): void {
    // console.log("Stage", "initialize");
    // dup with constructor super()
    // PIXI.Container.call(this);
  }

  /**
   * Destroys the stage.
   */
  destroy(): void {
    const options = { children: true, texture: true };
    super.destroy(options);
  }
}

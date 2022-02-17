import { PIXIContainer } from "./Extend";

//-----------------------------------------------------------------------------
/**
 * The root object of the display tree.
 *
 * @class
 * @extends PIXI.Container
 */
export class Stage extends PIXIContainer {
  constructor(arg?: Constructable<Stage>) {
    super();
    if (arg !== Stage) {
      this.initialize();
    }
  }

  initialize(): void {
    // console.log("Stage", "initialize");
    // dup with constructor super()
    super._initialize();
  }

  /**
   * Destroys the stage.
   */
  destroy(): void {
    const options = { children: true, texture: true };
    super.destroy(options);
  }
}

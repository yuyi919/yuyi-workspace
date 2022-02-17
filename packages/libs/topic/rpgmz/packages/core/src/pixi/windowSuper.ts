import { PIXIContainer } from "./Extend";

/**
 * The super window in the game.
 *
 * @class
 * @extends PIXI.Container
 */
export class SuperWindow extends PIXIContainer {
  constructor(args?: Constructable<SuperWindow>) {
    super();
    if (!args) {
      super._initialize();
    }
  }
  children: SuperWindow[];
  update(): void {
    const { children } = this;
    for (let i = children.length; --i > -1; ) {
      children[i].update?.();
    }
  }
}

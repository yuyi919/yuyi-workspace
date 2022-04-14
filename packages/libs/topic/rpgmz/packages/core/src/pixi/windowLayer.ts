//import * as PIXI from "pixi.js";
import { Window } from "./window";
import { SuperWindow } from "./windowSuper";

declare module "pixi.js" {
  namespace systems {
    interface FramebufferSystem {
      forceStencil(): void;
    }
  }
}

//-----------------------------------------------------------------------------
/**
 * The layer which contains game windows.
 *
 * @class
 * @extends PIXI.Container
 */
export class WindowLayer extends SuperWindow {
  constructor();
  constructor(thisClass: Constructable<WindowLayer>);
  constructor(arg?: any) {
    super();
    if (arg === WindowLayer) {
      return;
    }
    this.initialize();
  }

  initialize(): void {
    // dup with constructor super()
    super._initialize();
  }

  /**
   * Updates the window layer for each frame.
   */
  update(): void {
    super.update();
    // for (const child of this.children) {
    //   if (child.update) {
    //     child.update();
    //   }
    // }
  }

  /**
   * Renders the object using the WebGL renderer.
   *
   * @param {PIXI.Renderer} renderer - The renderer.
   */
  render(renderer: PIXI.Renderer): void {
    if (!this.visible) {
      return;
    }

    const graphics = new PIXI.Graphics();
    const gl = renderer.gl;
    const children = this.children.clone();

    renderer.framebuffer.forceStencil();
    graphics.transform = this.transform;
    renderer.batch.flush();
    gl.enable(gl.STENCIL_TEST);

    while (children.length > 0) {
      const win = children.pop() as WindowLayer & Window;
      if (win._isWindow && win.visible && win.openness > 0) {
        gl.stencilFunc(gl.EQUAL, 0, ~0);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
        win.render(renderer);
        renderer.batch.flush();
        graphics.clear();
        win.drawShape(graphics);
        gl.stencilFunc(gl.ALWAYS, 1, ~0);
        gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);
        gl.blendFunc(gl.ZERO, gl.ONE);
        graphics.render(renderer);
        renderer.batch.flush();
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      }
    }

    gl.disable(gl.STENCIL_TEST);
    gl.clear(gl.STENCIL_BUFFER_BIT);
    gl.clearStencil(0);
    renderer.batch.flush();

    for (const child of this.children) {
      if (!(child as Window)._isWindow && child.visible) {
        child.render(renderer);
      }
    }

    renderer.batch.flush();
  }
}

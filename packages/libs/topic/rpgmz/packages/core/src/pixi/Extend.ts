// import * as PIXI from "pixi.js";
export function Extend<T extends Constructable<any>>(constructor: T) {
  function Constructor() {}
  Constructor.prototype = Object.create(constructor.prototype);
  Constructor.prototype.constructor = Constructor;
  Constructor.prototype._initialize = function () {
    // dup with constructor super()
    constructor.apply(this, arguments);
  };
  return Constructor as unknown as Constructable<
    InstanceType<T> & {
      _initialize(...args: T extends new (...args: infer Args) => any ? Args : []): void;
    }
  >;
}

export const PIXIContainer = Extend(PIXI.Container);
export const PIXITilingSprite = Extend(PIXI.TilingSprite);
export const PIXISprite = Extend(PIXI.Sprite);
export const PIXIFilter = Extend(PIXI.Filter);
export const PIXIPoint = Extend(PIXI.Point);
export const PIXIRectangle = Extend(PIXI.Rectangle);
export const PIXIObjectRenderer = Extend(PIXI.ObjectRenderer);

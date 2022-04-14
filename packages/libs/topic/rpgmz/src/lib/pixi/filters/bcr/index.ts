import vertex from "../default.vert?raw";
import fragment from "./fragment2.frag?raw";

/**
 * The AmoyBrokenCamDistortionFilter applies the effect to an object.<br>
 * ![original](../tools/screenshots/dist/original.png)![filter](../tools/screenshots/dist/AmoyBrokenCamDistortionFilter.gif)
 *
 * @class
 * @extends PIXI.Filter
 * @memberof AMOY.filters
 * @see {@link https://www.npmjs.com/package/@amoy/filter-broken-cam-distortion}
 * @see {@link https://www.npmjs.com/package/@amoy/filters}
 * @param {number} [delta=0] - For animating interlaced lines
 */

class AmoyBrokenCamDistortionFilter extends PIXI.Filter {
  declare uniforms: {
    uTime: number;
    uLevel: number;
    uDistortion: number;
    uSpeed: number;
    uRollSpeed: number;
  };
  constructor(data: Partial<Pick<AmoyBrokenCamDistortionFilter, "delta" | "level">> = {}) {
    super(vertex, fragment);
    this.delta = 1;
    this.level = 10;
    this.uniforms.uDistortion = 0;
    this.uniforms.uSpeed = 1;
    this.uniforms.uRollSpeed = 1;
    // uniform float distortion;
    // uniform float uLevel;
    // uniform float speed;
    // uniform float rollSpeed;
    Object.assign(this, data);
    const set = (t) => {
      if (this.delta > 1000) {
        this.delta = 1;
      } else {
        this.delta+=18;
      }
      requestAnimationFrame(set);
    };
    requestAnimationFrame(set);
  }

  /**
   * Override existing apply method in PIXI.Filter
   * @internal
   * @beta
   */
  apply(
    filterManager: PIXI.systems.FilterSystem,
    input: PIXI.RenderTexture,
    output: PIXI.RenderTexture,
    clear: boolean,
    currentState?: any
  ) {
    this.uniforms.uTime = Math.max(1, this.uniforms.uTime);
    this.uniforms.uLevel = Math.max(0, this.uniforms.uLevel);
    filterManager.applyFilter(this, input, output, clear);
    // console.log(currentState)
  }

  /**
   * time for animation
   *
   * @default 0.0
   */
  get delta() {
    return this.uniforms.uTime;
  }
  set delta(value) {
    this.uniforms.uTime = value;
  }

  /**
   * time for animation
   *
   * @default 0.0
   */
  get level() {
    return this.uniforms.uLevel;
  }
  set level(value) {
    this.uniforms.uLevel = value;
  }
}

export { AmoyBrokenCamDistortionFilter };

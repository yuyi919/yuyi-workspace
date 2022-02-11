import { is } from "@yuyi919/shared-types";
import { defaults } from "lodash-es";
import { Container, Graphics, MaskData, Rectangle } from "pixi.js";
import { IContainerLike, Scroller } from "./scroller";
import { getPoint } from "./utils";

// 挟持的原生事件
const ORIGIN_EVENT_MAP = [
  {
    name: "pointerdown",
    fn: "_start",
  },
  {
    name: "pointermove",
    fn: "_move",
  },
  {
    name: "pointerup",
    fn: "_end",
  },
  {
    name: "pointerupoutside",
    fn: "_end",
  },
  {
    name: "pointercancel",
    fn: "_end",
  },
];

export class ScrollContainer extends Container {
  constructor(public scroller: PixiBetterScroller) {
    super();
  }
}

export default class PixiBetterScroller extends Container implements IContainerLike {
  //@ts-ignore
  public get width() {
    return is.num(this._options.width) ? this._options.width : 500;
  }
  public set width(val: number) {
    if (this._options.width === val) return;
    this._options.width = val;
    this._createMask();
    this.initScroller();
  }

  //@ts-ignore
  public get height() {
    return is.num(this._options.height) ? this._options.height : 500;
  }
  public set height(val: number) {
    if (this._options.height === val) return;
    this._options.height = val;
    this._createMask();
    this.initScroller();
  }

  //@ts-ignore
  public get x() {
    return is.num(this._options.x) ? this._options.x : 0;
  }
  public set x(val: number) {
    this._options.x = val;
  }

  //@ts-ignore
  public get y() {
    return is.num(this._options.y) ? this._options.y : 0;
  }
  public set y(val: number) {
    this._options.y = val;
  }
  public get scrolling() {
    return !!(this.XScroller.scrolling && this.YScroller.scrolling);
  }

  public _options: PScroller.IOps;
  public radius: number = 0;

  public scrollX: boolean;
  public XScroller: Scroller;

  public scrollY: boolean;
  public YScroller: Scroller;

  public content: Container;
  public static: Container;
  public maskData: Graphics | undefined;

  private touching: boolean = false;
  private touchStartPoints: PScroller.Point[] = [];
  private curPoints: PScroller.Point[] = [];

  public _config = {
    // 触发惯性滚动的 触摸时间上限
    timeForEndScroll: 300,
  };
  constructor(options: PScroller.IOps = {}) {
    super();
    this._options = options;
    for (const attr of ["scrollX", "scrollY", "radius"]) {
      if (!is.undefined(options[attr])) this[attr] = options[attr];
    }
    this._config = defaults(this._config, this._options.config || {});
  }

  public init() {
    this._init();
    this.createScroller();
    return this;
  }

  private _init() {
    this.sortableChildren = true;
    this.name = "Scroller";

    this._createMask();
    super.addChild((this.static = new Container()));
    this.static.name = "Static";
    this.static.zIndex = 1;

    super.addChild((this.content = new Container()));
    this.content.name = "Context";
    this.content.zIndex = 9;
    console.log(this);
    this._bindOriginEvent();
  }

  update() {}

  back: Graphics;
  private _createMask() {
    if (this.maskData) {
      this._removeMask();
    }

    const rect = new Graphics();
    rect.beginFill(0xffffff, 1);
    if (this.radius) {
      rect.drawRoundedRect(0, 0, this.width, this.height, this.radius);
    } else {
      rect.drawRect(0, 0, this.width, this.height);
    }

    rect.endFill();
    if (this.radius) {
      this.mask = rect;
    } else {
      const mask = new MaskData(rect);
      mask.type = 1;
      mask.autoDetect = false;
      this.mask = mask;
      this.hitArea = new Rectangle(0, 0, this.width, this.height);
    }
    this.maskData = rect;
    super.addChild(rect);
    const back = new Graphics(rect.geometry);
    super.addChild(back);
    this.back = back;
  }
  private _removeMask() {
    super.removeChild(this.maskData);
    super.removeChild(this.back);
    this.back.destroy();
    this.maskData.destroy();
    this.back = null;
    this.maskData = null;
    this.mask = null;
  }

  private _bindOriginEvent() {
    this.interactive = true;
    ORIGIN_EVENT_MAP.map(({ name, fn }) => {
      this.on(name, this[fn], this);
    });
  }
  private _unbindOriginEvent() {
    this.interactive = false;
    ORIGIN_EVENT_MAP.map(({ name, fn }) => {
      this.off(name, this[fn], this);
    });
  }
  public _start(ev: PScroller.PixiEvent) {
    const startPoint = getPoint(ev);
    this.touchStartPoints.push(startPoint);
    this.curPoints.push(startPoint);

    this.touchScroller((this.touching = true));
  }
  public _move(ev: PScroller.PixiEvent) {
    if (!this.touching) return;

    const curPoint = getPoint(ev);
    const lastPoint = this._findLastPoint(curPoint.id);
    if (!lastPoint) return;

    const deltaX = curPoint.x - lastPoint.x;
    const deltaY = curPoint.y - lastPoint.y;

    this.scrollScroller(deltaX, deltaY);
    this._replaceCurPoint(curPoint);
  }
  public _end(ev: PScroller.PixiEvent) {
    this.touchScroller((this.touching = false));
    const endPoint = getPoint(ev);
    const startPoint = this._findStartPoint(endPoint.id);
    if (!startPoint) return;

    const deltaT = endPoint.t - startPoint.t;
    const deltaX = endPoint.x - startPoint.x;
    const deltaY = endPoint.y - startPoint.y;

    this.handleScrollEnd(deltaX, deltaY, deltaT);

    this.touchStartPoints = [];
    this.curPoints = [];
  }

  private _findStartPoint(id: number) {
    for (let i = 0; i < this.touchStartPoints.length; i++) {
      const point = this.touchStartPoints[i];
      if (point.id === id) return point;
    }
    return undefined;
  }

  private _findLastPoint(id: number) {
    for (let i = 0; i < this.curPoints.length; i++) {
      const point = this.curPoints[i];
      if (point.id === id) return point;
    }
    return undefined;
  }

  private _replaceCurPoint(curPoint: PScroller.Point) {
    const startPoint = this._findLastPoint(curPoint.id);
    if (startPoint) {
      const index = this.curPoints.indexOf(startPoint);
      this.curPoints.splice(index, 1, curPoint);
    }
  }

  public addItem(elm: any, scrollable: boolean = true) {
    if (scrollable) {
      this.content.addChild(elm);
      this.initScroller();
    } else {
      this.static.addChild(elm);
    }
  }

  addChild(...args) {
    for (const child of args) {
      child && this.addItem(child);
    }
    return args[0];
  }

  public removeItem(elm: any) {
    if (elm) {
      this.content.removeChild(elm);
      this.static.removeChild(elm);
    } else {
      this.static.removeChildren();
      this.content.removeChildren();
    }
  }

  removeChild(...args) {
    for (const child of args) {
      child && this.removeItem(child);
    }
    return args[0];
  }

  public destroy(options?: PScroller.destroyOps) {
    this._unbindOriginEvent();
    super.destroy(options);
  }

  public scrollTo(end: number | number[], hasAnima: boolean = true) {
    let endX: number, endY: number;
    if (is.num(end)) {
      endX = endY = end;
    } else if (is.arr<number>(end)) {
      endX = end[0];
      endY = end[1];
    }

    if (hasAnima) {
      this.XScroller.scrollTo(-endX);
      this.YScroller.scrollTo(-endY);
    } else {
      this.XScroller.setPos(-endX);
      this.YScroller.setPos(-endY);
    }
  }

  // control scroller
  private createScroller() {
    const createOpt = (dire: "hor" | "ver") => {
      const scrollable = dire === "hor" ? this.scrollX : this.scrollY;
      return {
        parent: this,
        target: this.content,
        dire,
        scrollable,
        config: this._options.config,
        onBounce: (pos: any, back: () => void, toBounce: any) => {
          if (is.fn(this._options.onBounce)) {
            this._options.onBounce(pos, back, toBounce);
          } else {
            back();
          }
        },
        onScroll: (pos: any, attr: any) => {
          if (is.fn(this._options.onScroll)) {
            this._options.onScroll(pos, attr);
          }
        },
      };
    };
    this.XScroller = new Scroller(createOpt("hor"));
    this.YScroller = new Scroller(createOpt("ver"));
  }
  private initScroller() {
    this.XScroller.init();
    this.YScroller.init();
  }
  private touchScroller(touching: boolean) {
    this.XScroller.setStatus(touching);
    this.YScroller.setStatus(touching);
  }
  private scrollScroller(deltaX: number, deltaY: number) {
    this.XScroller.scroll(deltaX);
    this.YScroller.scroll(deltaY);
  }
  private handleScrollEnd(deltaX: number, deltaY: number, deltaT: number) {
    if (this.XScroller.isToBounce()) {
      // 当正在回弹
      // 且结束点未超过回弹终点时
      // 继续回弹
      this.XScroller.bounceBack();
    } else if (deltaT < this._config.timeForEndScroll) {
      // 否则触发惯性滚动
      if (!deltaX) return;
      const speed = deltaX / deltaT;
      this.XScroller.inertiaScroll(speed);
    }

    if (this.YScroller.isToBounce()) {
      // 当正在回弹
      // 且结束点未超过回弹终点时
      // 继续回弹
      this.YScroller.bounceBack();
    } else if (deltaT < this._config.timeForEndScroll) {
      // 否则触发惯性滚动
      if (!deltaY) return;
      const speed = deltaY / deltaT;
      this.YScroller.inertiaScroll(speed);
    }
  }
}

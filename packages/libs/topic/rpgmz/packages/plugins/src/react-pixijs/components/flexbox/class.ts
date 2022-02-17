import wasm from "@lazarv/wasm-yoga";
import { defaults, isEqual, throttle } from "lodash-es";
import { Group } from "./context";
import { FlexCustomFullProps, R3FlexProps, setYogaProperties } from "./props";
import { getRootShift } from "./utils";

let yoga: Yoga, loader: Promise<Yoga>;
type Pos = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export async function loadYoga() {
  if (!loader) {
    loader = wasm();
  }
  yoga = await loader;
  if (loader) loader = void 0;
  globalThis.YOGA = yoga;
  globalThis.FlexNode = FlexNode;
  return yoga;
}

export type FlexNodeConfig = {
  centerAnchor: boolean;
  yogaConfig?: YGConfig;
};

let id = 0;
export abstract class FlexNode {
  static loadYoga = loadYoga;
  static getYoga() {
    return yoga;
  }
  static createYogaNode(props: R3FlexProps) {
    const node = yoga.Node.createDefault();
    setYogaProperties(yoga, node, props, 1);
    return node;
  }
  node: YGNode;
  id = id++;
  // get id() {
  //   return [this.parent?.id, this._id].filter(Boolean).join("-");
  // }

  protected _root: FlexRootNode;
  protected _onComputed: (layout: YGLayout) => any;

  constructor(
    public flexProps: R3FlexProps,
    public config: FlexNodeConfig,
    public parent?: FlexNode
  ) {
    const { Node } = yoga;
    this.node = config.yogaConfig ? Node.createWithConfig(config.yogaConfig) : Node.createDefault();
  }
  layout?: YGLayout;
  mounted = false;

  get root(): FlexRootNode {
    return this.parent?.root || this._root;
  }
  set root(root: FlexRootNode) {
    this._root = root;
  }

  get scaleFactor() {
    return this.root?.scaleFactor;
  }

  abstract update(...args: any[]): void;

  onComputed(handle: (position: Pos, layout: YGLayout) => any): any {
    this._onComputed = (layout) => {
      const node = this.computedLayout(layout);
      return handle(node, layout);
    };
  }

  destory() {
    this._onComputed = null;
    this.parent?.removeChild(this);
  }

  fireComputed(layout: YGLayout) {
    return this._onComputed?.(layout);
  }

  append(node: FlexNode, group: any): FlexNode {
    node.parent = this;
    this.node.insertChild(node.node, this.node.getChildCount());
    return this.root.registerBox(node, group);
  }

  removeChild(node: FlexNode) {
    if (this.root) {
      this.root.unregisterBox(node);
    }
    this.node.removeChild(node.node);
    node.parent = void 0;
    node.root = void 0;
  }

  computedLayout(
    layout = this.node.getComputedLayout(),
    centerAnchor = this.config.centerAnchor
  ): Pos {
    const { scaleFactor } = this;
    const { left, top, ...pos } = layout;
    const width = pos.width / scaleFactor;
    const height = pos.height / scaleFactor;
    // console.log(width, height, left / scaleFactor, top / scaleFactor);
    const x = left / scaleFactor + (centerAnchor ? width / 2 : 0);
    const y = top / scaleFactor + (centerAnchor ? height / 2 : 0);
    return { x, y, width, height };
  }
}

export class FlexNodeItem extends FlexNode {
  update(props: R3FlexProps, config?: Partial<FlexNodeConfig>) {
    setYogaProperties(yoga, this.node, props, this.root.scaleFactor);
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }
}

export class FlexRootNode extends FlexNode {
  children: FlexNodeItem[] = [];
  inited = false;
  constructor(public props: FlexCustomFullProps, public flexProps: R3FlexProps, config?: YGConfig) {
    super(flexProps, {
      centerAnchor: props.centerAnchor,
      yogaConfig: config,
    });
    this._root = this;
    const ref = throttle(this.reflow, 17);
    this.reflow = async (node, disabled) => {
      return ref.call(this, node, disabled);
    };
  }

  update(config: FlexCustomFullProps, props: R3FlexProps) {
    setYogaProperties(yoga, this.node, props, this.scaleFactor);
    if (config) {
      const { centerAnchor = this.config.centerAnchor } = config;
      this.props = defaults(this.props, config);
      this.config = { ...this.config, centerAnchor };
    }
    if (!this.inited) {
      this.inited = true;
      console.log("inited");
    }
  }

  get scaleFactor() {
    return this.props.scaleFactor;
  }

  registerBox(node: FlexNodeItem, group: Group) {
    console.log("registerBox", node);
    const i = this.children.indexOf(node);
    if (i > -1) {
      this.children.splice(i, 1);
    }
    const box: FlexNodeItem = node;
    this.children.push(node);
    this.reflow(node, true);
    return box;
  }

  unregisterBox(node: FlexNode) {
    const i = this.children.indexOf(node);
    if (i > -1) {
      this.children.splice(i, 1);
    }
  }

  async reflow(source: FlexNode, disableSizeRecalc?: boolean) {
    if (this.inited) {
      return this._reflow(disableSizeRecalc);
    }
    console.log("blocked", source);
  }

  private _reflow(disableSizeRecalc?: boolean) {
    if (!disableSizeRecalc) {
      // Recalc all the sizes
      for (const node of this.children) {
        const { flexProps } = node;
        const scaledWidth = flexProps.width;
        const scaledHeight = flexProps.height;

        if (scaledWidth !== undefined && scaledHeight !== undefined) {
          // Forced size, no need to calculate bounding box
          node.update({
            width: flexProps.width,
            height: flexProps.height,
          });
        } else if (node.node.getChildCount() === 0) {
          // No size specified, calculate size
          // if (rootGroup.current) {
          //   getOBBSize(group, rootGroup.current, boundingBox, vec)
          // } else {
          //   // rootGroup ref is missing for some reason, let's just use usual bounding box
          //   boundingBox.setFromObject(group).getSize(vec)
          // }
          node.update({
            width: flexProps.width,
            height: flexProps.height,
          });
        }
      }
    }
    const {
      node,
      scaleFactor,
      props: { yogaDirection, centerAnchor: rootCenterAnchor, flexWidth, flexHeight },
    } = this;
    // Perform yoga layout calculation
    node.calculateLayout(flexWidth * scaleFactor, flexHeight * scaleFactor, yogaDirection);
    console.log("calculateLayout", [...this.children], this, node.getComputedLayout());
    const rootWidth = node.getComputedWidth();
    const rootHeight = node.getComputedHeight();

    let minX = 0;
    let maxX = 0;
    let minY = 0;
    let maxY = 0;
    // Reposition after recalculation

    for (const node of this.children) {
      const layout = node.node.getComputedLayout();
      // console.log("calculateLayout", layout);
      const { left, top, width, height } = layout;
      const [mainAxisShift, crossAxisShift] = getRootShift(
        rootCenterAnchor,
        rootWidth,
        rootHeight,
        node.node
      );

      if (!isEqual(node.layout, layout)) {
        node.layout = layout;
        // const position = vectorFromObject({
        //   [mainAxis]: (mainAxisShift + left + (centerAnchor ? width / 2 : 0)) / scaleFactor,
        //   [crossAxis]: -(crossAxisShift + top + (centerAnchor ? height / 2 : 0)) / scaleFactor,
        //   [depthAxis]: 0,
        // } as any);
        node.fireComputed?.(layout);
      }

      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, left + width);
      maxY = Math.max(maxY, top + height);

      node.mounted = true;
      // group.position.copy(position);
      // console.log(node, left, top, width, height);
    }
    return {
      width: (maxX - minX) / scaleFactor,
      height: (maxY - minY) / scaleFactor,
    };
  }
}

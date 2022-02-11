import React from "react";
import { FlexNode, FlexNodeConfig, FlexNodeItem, FlexRootNode } from "./class";
import { BoxContext, FlexContext, Group, RootFlexContext } from "./context";
import { FlexCustomFullProps, FlexCustomProps, FlexPlane, R3FlexProps } from "./props";

export function getFlex2DSize(sizes: [number, number, number], plane: FlexPlane) {
  switch (plane) {
    case "xy":
      return [sizes[0], sizes[1]];
    case "yz":
      return [sizes[1], sizes[2]];
    case "xz":
      return [sizes[0], sizes[2]];
  }
}

const context = React.createContext<Yoga>(null);
const { Provider } = context;
export const YogaProvider: React.ComponentType<{}> = (props) => {
  const [yogaState, setYoga] = React.useState<Yoga>(FlexNode.getYoga());
  React.useEffect(() => {
    if (!yogaState) {
      FlexNode.loadYoga().then(setYoga);
    }
  }, []);
  // React.useContext(context);
  return <Provider value={yogaState}>{yogaState ? props.children : []}</Provider>;
};

const getIsTopLevelChild = (node: YGNode) => !node.getParent()?.getParent();

/** @returns [mainAxisShift, crossAxisShift] */
export const getRootShift = (
  rootCenterAnchor: boolean | undefined,
  rootWidth: number,
  rootHeight: number,
  node: YGNode
) => {
  if (!rootCenterAnchor || !getIsTopLevelChild(node)) {
    return [0, 0];
  }
  const mainAxisShift = -rootWidth / 2;
  const crossAxisShift = -rootHeight / 2;
  return [mainAxisShift, crossAxisShift] as const;
};
export const Flex: React.ComponentType<FlexProps> = (props) => {
  const [
    root,
    { disableSizeRecalc, invalidate, centerAnchor, onReflow, flexWidth, flexHeight },
    flexProps,
  ] = useBaseRootNode(props);
  const dirtyRef = React.useRef(true);
  const requestReflow = React.useCallback(() => {
    dirtyRef.current = true;
    invalidate?.();
  }, [invalidate]);
  // We need to reflow everything if flex props changes
  React.useLayoutEffect(() => {
    requestReflow();
  }, [props.children, flexProps, requestReflow]);
  const sharedBoxContext = React.useMemo<BoxContext>(
    () => ({ node: root, size: [flexWidth, flexHeight, 0, 0], centerAnchor }),
    [root, flexWidth, flexHeight, centerAnchor]
  );
  const sharedFlexContext = React.useMemo<RootFlexContext>(() => {
    return {
      requestReflow,
    };
  }, [requestReflow]);
  React.useEffect(() => {
    if (dirtyRef.current) {
      dirtyRef.current = false;
      const { width, height } = root.reflow(disableSizeRecalc);
      // Call the reflow event to update resulting size
      // console.log("width, height", width, height);
      onReflow?.(width, height);
      // Ask react-three-fiber to perform a render (invalidateFrameLoop)
      invalidate?.();
    }
  });
  return (
    <FlexContext.Provider value={sharedFlexContext}>
      <BoxContext.Provider value={sharedBoxContext}>{props.children}</BoxContext.Provider>
    </FlexContext.Provider>
  );
};

export function useBaseNode(props: BoxProps, config: FlexNodeConfig, parent?: FlexNode) {
  const flexProps = useR3FlexProps(props);
  const node = React.useMemo(() => {
    return new FlexNodeItem(flexProps, config, parent);
  }, []);
  React.useLayoutEffect(() => {
    node.update(flexProps, config);
  }, [flexProps, node, parent, config.centerAnchor]);
  return [node, flexProps] as const;
}
export function useBaseRootNode(props: R3FlexProps, config?: YGConfig) {
  const [custom, flexStyles] = useRootFlexProps(props);
  const node = React.useMemo(() => {
    return new FlexRootNode(custom, flexStyles, config);
  }, []);
  React.useLayoutEffect(() => {
    node.update(custom, flexStyles);
  }, [node, flexStyles, custom]);
  return [node, custom, flexStyles] as const;
}

export const FlexBox: React.ComponentType<BoxProps> = React.forwardRef((props, ref) => {
  const { children, centerAnchor } = props;
  const { node: parent } = React.useContext(BoxContext);
  const [size, setSize] = React.useState<[x: number, y: number, width: number, height: number]>([
    0, 0, 0, 0,
  ]);
  const mounted = React.useRef(false);
  const [node, flexProps] = useBaseNode(props, { centerAnchor }, parent);
  const epsilon = 1 / node.scaleFactor;
  const sharedBoxContext = React.useMemo<BoxContext>(
    () => ({ node, size, centerAnchor }),
    [node, size, centerAnchor]
  );
  const group = React.useRef<Group>();
  // Make child known to the parents yoga instance *before* it calculates layout
  React.useLayoutEffect(() => {
    if (!parent) return;
    parent.append(node, group.current);
    node.onComputed(({ x, y, width, height }) => {
      if (
        !mounted.current ||
        Math.abs(x - size[0]) > epsilon ||
        Math.abs(y - size[1]) > epsilon ||
        Math.abs(width - size[2]) > epsilon ||
        Math.abs(height - size[3]) > epsilon
      ) {
        mounted.current = true;
        setSize([x, y, width, height]);
      }
    });
    // Remove child on unmount
    return () => {
      parent.removeChild(node);
    };
  }, [node, parent, flexProps, centerAnchor]);
  // We need to reflow if props change

  const { requestReflow } = React.useContext(FlexContext);
  React.useLayoutEffect(() => {
    requestReflow();
  }, [children, flexProps, requestReflow]);

  const nextProps = React.useMemo(
    () => ({
      x: size[0],
      y: size[1],
      width: size[2],
      height: size[3],
      anchor: centerAnchor ? 0.5 : void 0,
    }),
    [size, centerAnchor, mounted.current]
  );
  return (
    <BoxContext.Provider value={sharedBoxContext}>
      {mounted.current &&
        (typeof children === "function"
          ? children(nextProps, mounted.current)
          : React.Children.map(children, (child) =>
              React.isValidElement(child) ? React.cloneElement(child, nextProps) : child
            ))}
    </BoxContext.Provider>
  );
});

export type BoxProps = {
  centerAnchor?: boolean;
  children:
    | React.ReactNode
    | ((
        props: { width: number; height: number; x: number; y: number; anchor?: number },
        visible?: boolean
      ) => React.ReactNode);
} & R3FlexProps;

export const rmUndefFromObj = (obj: Record<string, any>) =>
  Object.keys(obj).forEach((key) => (obj[key] === undefined ? delete obj[key] : {}));

function useR3FlexProps({
  // Non-flex props
  children,
  centerAnchor,

  // flex props
  flexDirection,
  flexDir,
  dir,

  alignContent,
  alignItems,
  alignSelf,
  align,

  justifyContent,
  justify,

  flexBasis,
  basis,
  flexGrow,
  grow,

  flexShrink,
  shrink,

  flexWrap,
  wrap,

  margin,
  m,
  marginBottom,
  marginLeft,
  marginRight,
  marginTop,
  mb,
  ml,
  mr,
  mt,

  padding,
  p,
  paddingBottom,
  paddingLeft,
  paddingRight,
  paddingTop,
  pb,
  pl,
  pr,
  pt,

  height,
  width,

  maxHeight,
  maxWidth,
  minHeight,
  minWidth,

  // other
  ...props
}: BoxProps) {
  const flexProps: R3FlexProps = React.useMemo(() => {
    const _flexProps = {
      flexDirection,
      flexDir,
      dir,

      alignContent,
      alignItems,
      alignSelf,
      align,

      justifyContent,
      justify,

      flexBasis,
      basis,
      flexGrow,
      grow,
      flexShrink,
      shrink,

      flexWrap,
      wrap,

      margin,
      m,
      marginBottom,
      marginLeft,
      marginRight,
      marginTop,
      mb,
      ml,
      mr,
      mt,

      padding,
      p,
      paddingBottom,
      paddingLeft,
      paddingRight,
      paddingTop,
      pb,
      pl,
      pr,
      pt,

      height,
      width,

      maxHeight,
      maxWidth,
      minHeight,
      minWidth,
    };

    rmUndefFromObj(_flexProps);
    return _flexProps;
  }, [
    align,
    alignContent,
    alignItems,
    alignSelf,
    dir,
    flexBasis,
    basis,
    flexDir,
    flexDirection,
    flexGrow,
    grow,
    flexShrink,
    shrink,
    flexWrap,
    height,
    justify,
    justifyContent,
    m,
    margin,
  ]);
  return flexProps;
}
export type FlexProps = React.PropsWithChildren<FlexCustomProps & R3FlexProps>;
function useRootFlexProps({
  // Non flex props
  size = [1, 1, 1],
  yogaDirection = "ltr",
  plane = "xy",
  children,
  scaleFactor = 100,
  onReflow,
  disableSizeRecalc = false,
  centerAnchor = false,

  // flex props

  flexDirection,
  flexDir,
  dir,

  alignContent,
  alignItems,
  alignSelf,
  align,

  justifyContent,
  justify,

  flexBasis,
  basis,
  flexGrow,
  grow,
  flexShrink,
  shrink,

  flexWrap,
  wrap,

  margin,
  m,
  marginBottom,
  marginLeft,
  marginRight,
  marginTop,
  mb,
  ml,
  mr,
  mt,

  padding,
  p,
  paddingBottom,
  paddingLeft,
  paddingRight,
  paddingTop,
  pb,
  pl,
  pr,
  pt,

  height,
  width,

  maxHeight,
  maxWidth,
  minHeight,
  minWidth,

  // other
  invalidate,
}: FlexProps) {
  // must memoize or the object literal will cause every dependent of flexProps to rerender everytime
  const flexProps: R3FlexProps = React.useMemo(() => {
    const _flexProps = {
      flexDirection,
      flexDir,
      dir,

      alignContent,
      alignItems,
      alignSelf,
      align,

      justifyContent,
      justify,

      flexBasis,
      basis,
      flexGrow,
      grow,
      flexShrink,
      shrink,

      flexWrap,
      wrap,

      margin,
      m,
      marginBottom,
      marginLeft,
      marginRight,
      marginTop,
      mb,
      ml,
      mr,
      mt,

      padding,
      p,
      paddingBottom,
      paddingLeft,
      paddingRight,
      paddingTop,
      pb,
      pl,
      pr,
      pt,

      height,
      width,

      maxHeight,
      maxWidth,
      minHeight,
      minWidth,
    };

    rmUndefFromObj(_flexProps);
    return _flexProps;
  }, [
    align,
    alignContent,
    alignItems,
    alignSelf,
    dir,
    flexBasis,
    basis,
    flexDir,
    flexDirection,
    flexGrow,
    grow,
    flexShrink,
    shrink,
    flexWrap,
    height,
    justify,
    justifyContent,
    m,
    margin,
    marginBottom,
    marginLeft,
    marginRight,
    marginTop,
    maxHeight,
    maxWidth,
    mb,
    minHeight,
    minWidth,
    ml,
    mr,
    mt,
    p,
    padding,
    paddingBottom,
    paddingLeft,
    paddingRight,
    paddingTop,
    pb,
    pl,
    pr,
    pt,
    width,
    wrap,
  ]);
  const yoga = FlexNode.getYoga();
  const [flexWidth, flexHeight] = getFlex2DSize(size, plane);
  const customProps = React.useMemo(
    () => ({
      size,
      plane,
      scaleFactor,
      onReflow,
      centerAnchor,
      disableSizeRecalc,
      yogaDirection:
        yogaDirection === "ltr"
          ? yoga.YGDirectionLTR
          : yogaDirection === "rtl"
          ? yoga.YGDirectionRTL
          : yogaDirection,
      flexWidth,
      flexHeight,
      invalidate,
    }),
    [
      size,
      plane,
      scaleFactor,
      onReflow,
      centerAnchor,
      disableSizeRecalc,
      yogaDirection,
      flexWidth,
      flexHeight,
      invalidate,
    ]
  );
  return [customProps as FlexCustomFullProps, flexProps] as const;
}

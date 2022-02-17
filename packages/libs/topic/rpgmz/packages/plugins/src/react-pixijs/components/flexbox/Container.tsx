import React from "react";
import { FlexNode, FlexRootNode } from "./class";
import { BoxContext, FlexContext, RootFlexContext } from "./context";
import { FlexCustomFullProps, FlexCustomProps, R3FlexProps } from "./props";
import { rmUndefFromObj, getFlex2DSize } from "./utils";

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
export type FlexProps = React.PropsWithChildren<FlexCustomProps & R3FlexProps>;
function useRootFlexProps({
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

  // Non flex props
  // size = [void 0, void 0, 1],
  yogaDirection = "ltr",
  plane = "xy",
  children,
  scaleFactor = 100,
  onReflow,
  disableSizeRecalc = false,
  centerAnchor = false,

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
  const [flexWidth, flexHeight] = [width, height]; //getFlex2DSize(size, plane);
  const customProps = React.useMemo(
    () => ({
      // size,
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
      // size,
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

export const Container: React.ComponentType<FlexProps> = (props) => {
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
  React.useEffect(() => {
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
    if (dirtyRef.current && root.inited) {
      // const { width, height } =
      root.reflow(root, disableSizeRecalc);
      // Call the reflow event to update resulting size
      // console.log("width, height", width, height);
      // onReflow?.(width, height);
      // Ask react-three-fiber to perform a render (invalidateFrameLoop)
      // invalidate?.();
      dirtyRef.current = false;
    }
  });
  return (
    <FlexContext.Provider value={sharedFlexContext}>
      <BoxContext.Provider value={sharedBoxContext}>{props.children}</BoxContext.Provider>
    </FlexContext.Provider>
  );
};
Container.displayName = "FlexContainer";

export default Container;

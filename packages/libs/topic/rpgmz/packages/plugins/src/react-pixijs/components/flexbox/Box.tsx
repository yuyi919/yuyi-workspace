import React from "react";
import { FlexNode, FlexNodeConfig, FlexNodeItem } from "./class";
import { BoxContext, FlexContext, Group } from "./context";
import { R3FlexProps } from "./props";
import { rmUndefFromObj } from "./utils";

export const Box: React.ComponentType<BoxProps> = React.forwardRef((props, ref) => {
  const { children, centerAnchor, component: Component } = props;
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
    node.onComputed(({ x, y, width, height }) => {
      if (
        !mounted.current ||
        Math.abs(x - size[0]) > epsilon ||
        Math.abs(y - size[1]) > epsilon ||
        Math.abs(width - size[2]) > epsilon ||
        Math.abs(height - size[3]) > epsilon
      ) {
        mounted.current = true;
        // console.log("setSize", x, y, width, height)
        setSize([x, y, width, height]);
      }
    });
    parent.append(node, group.current);
    // Remove child on unmount
    return () => {
      node.destory();
    };
  }, [node, parent, group.current]);
  // We need to reflow if props change
  const { requestReflow } = React.useContext(FlexContext);
  React.useEffect(() => {
    requestReflow();
  }, [children, flexProps, requestReflow]);

  const nextProps = React.useMemo(
    () => ({
      x: size[0],
      y: size[1],
      width: size[2],
      height: size[3],
      anchor: centerAnchor ? 0.5 : void 0,
      ready: mounted.current,
    }),
    [size, centerAnchor, mounted.current]
  );
  return (
    <BoxContext.Provider value={sharedBoxContext}>
      {typeof children === "function" ? (
        children(nextProps)
      ) : Component ? (
        <Component {...nextProps}>{children}</Component>
      ) : (
        React.Children.map(children, (child) =>
          React.isValidElement(child) ? React.cloneElement(child, nextProps) : child
        )
      )}
    </BoxContext.Provider>
  );
});
Box.displayName = "FlexBox";

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

export type BoxRenderProps =
  | {
      width: number;
      height: number;
      x: number;
      y: number;
      anchor?: number;
      ready: true;
    }
  | {
      width?: number;
      height?: number;
      x?: number;
      y?: number;
      anchor?: number;
      ready: false;
    };

export type BoxProps = {
  centerAnchor?: boolean;
  children: React.ReactNode | ((props: BoxRenderProps) => React.ReactNode);
  component?: React.ComponentType<BoxRenderProps>;
} & R3FlexProps;
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

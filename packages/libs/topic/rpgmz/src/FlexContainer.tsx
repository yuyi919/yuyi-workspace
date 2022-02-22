import { Container, Sprite, _ReactPixi } from "@inlet/react-pixi/animated";
import { AnimatedDisplayObjectProps } from "@plugins/react-pixijs";
import { FlexBox, FlexProps } from "@plugins/react-pixijs/components";
import { to } from "@react-spring/web";
import { defaults } from "lodash";
import React from "react";

export const FlexContainer = React.forwardRef<
  PIXI.Container,
  React.PropsWithChildren<
    AnimatedDisplayObjectProps<PIXI.Container> & { background?: boolean; flex?: FlexProps }
  >
>(({ flex, children, x, y, scale, visible, background, ...props }, ref) => {
  const flexProps = React.useMemo(() => {
    const { width, height } = props;
    return defaults(flex, { width, height });
  }, [flex, props.width, props.height]);
  return (
    <FlexBox {...flexProps}>
      {({ ready, ...renderer }) => {
        ready && console.log(renderer, ref);
        const xy = {
          x: to(x ?? 0, (x) => x + renderer.x),
          y: to(y ?? 0, (x) => x + renderer.y)
        };
        return (
          <Container
            ref={ref}
            {...(ready
              ? {
                  ...renderer,
                  ...xy,
                  visible: visible ?? true
                }
              : { visible: false })}
            scale={(scale as _ReactPixi.PointLike) || 1}
            {...props}
          >
            {background && (
              <Sprite
                texture={PIXI.Texture.WHITE}
                tint={0xaddb67}
                width={flexProps.width}
                height={flexProps.height}
                anchor={renderer.anchor}
              />
            )}
            {children}
          </Container>
        );
      }}
    </FlexBox>
  );
});
FlexContainer.displayName = "FlexContainer";

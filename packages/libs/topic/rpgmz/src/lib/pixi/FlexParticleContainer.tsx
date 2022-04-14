import { Sprite, ParticleContainer, _ReactPixi } from "@inlet/react-pixi/animated";
import { AnimatedDisplayObjectProps } from "@plugins/react-pixijs";
import { FlexBox, FlexProps } from "@plugins/react-pixijs/components";
import { defaults } from "lodash";
import React from "react";

export const FlexParticleContainer = React.forwardRef<
  PIXI.ParticleContainer,
  React.PropsWithChildren<
    AnimatedDisplayObjectProps<PIXI.ParticleContainer> & { background?: boolean; flex?: FlexProps }
  >
>(({ flex, children, scale, visible, background, ...props }, ref) => {
  const flexProps = React.useMemo(() => {
    const { width, height } = props;
    return defaults(flex, { width, height });
  }, [flex, props.width, props.height]);
  return (
    <FlexBox {...flexProps}>
      {({ ready, width, height, ...renderer }) => {
        ready && console.log(renderer, ref);
        return (
          <ParticleContainer
            properties={{ position: true }}
            ref={ref}
            {...(ready ? { ...renderer, visible: visible ?? true } : { visible: false })}
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
          </ParticleContainer>
        );
      }}
    </FlexBox>
  );
});
FlexParticleContainer.displayName = "FlexParticleContainer";

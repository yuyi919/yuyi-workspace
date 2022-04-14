import { Container, NineSlicePlane, TilingSprite } from "@inlet/react-pixi/animated";
import { AnimatedDisplayObjectProps } from "@plugins/react-pixijs";
import { to } from "@react-spring/web";
import React from "react";
import { loadWithResource, ResourceIds, SystemLoader } from "../SystemLoader";

export const InfoWindow: React.FC<IInfoWindowProps> = ({
  x,
  y,
  width,
  height,
  mask,
  children,
  ...other
}) => {
  const [localWidth, setWidth] = React.useState(width);
  const [localHeight, setHeight] = React.useState(height);
  const poivot = React.useMemo(
    () =>
      to([width, height], (width, height) => ({
        x: width / 2,
        y: height / 2
      })),
    [width, height]
  );
  return (
    <Container interactive x={x} y={y} {...other}>
      <NineSlicePlane
        pivot={poivot}
        width={localWidth}
        height={localHeight}
        leftWidth={11}
        rightWidth={11}
        topHeight={11}
        bottomHeight={11}
        texture={loadWithResource(ResourceIds.DialogJson, ResourceIds.InfoWindowFrame)}
      >
        <TilingSprite
          x={10}
          y={10}
          tilePosition={to([localWidth, localHeight], (localWidth, localHeight) => [
            (localWidth % 51) / 2,
            1 + (localHeight % 51) / 2
          ])}
          width={to(localWidth, (localWidth) => localWidth - 20)}
          height={to(localHeight, (localHeight) => localHeight - 20)}
          texture={loadWithResource(ResourceIds.DialogJson, ResourceIds.InfoWindowBack)}
        />
      </NineSlicePlane>
    </Container>
  );
};

InfoWindow.defaultProps = {
  width: 330,
  height: 120
};

interface IInfoWindowProps extends AnimatedDisplayObjectProps<PIXI.Container> {}

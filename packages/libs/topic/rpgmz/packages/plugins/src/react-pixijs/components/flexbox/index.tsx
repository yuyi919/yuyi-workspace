import React from "react";
import { FlexNode } from "./class";
import { Container, FlexProps } from "./Container";
import { BoxProps, BoxRenderProps } from "./Box";

const context = React.createContext<Yoga>(null);
const { Provider: YogaProviderNative } = context;
const FlexContainer = React.lazy(async () => {
  await Promise.all([FlexNode.loadYoga()]);
  return { default: Container };
});
export const YogaProvider: React.ComponentType<{}> = (props) => {
  const yoga = React.useContext(context);
  const [yogaState, setYoga] = React.useState<Yoga>(yoga || FlexNode.getYoga());
  React.useEffect(() => {
    if (!yogaState) {
      FlexNode.loadYoga().then(setYoga);
    }
  }, []);
  return (
    <YogaProviderNative value={yogaState}>{yogaState ? props.children : []}</YogaProviderNative>
  );
};

export const Flex: React.FC<FlexProps> = (props) => {
  const yoga = React.useContext(context);
  if (yoga) {
    return <Container {...props}>{props.children}</Container>;
  }
  return (
    <React.Suspense fallback={null}>
      <YogaProvider>
        <FlexContainer {...props}>{props.children}</FlexContainer>
      </YogaProvider>
    </React.Suspense>
  );
};

export { FlexContainer };
export { Box as FlexBox } from "./Box";
export type { BoxProps as FlexBoxProps, BoxRenderProps as FlexBoxRenderProps, FlexProps };

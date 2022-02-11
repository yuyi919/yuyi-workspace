import { createContext } from "react";
import { FlexNode, FlexNodeItem } from "./class";
import { R3FlexProps } from "./props";

export type Group = any;
export interface RootFlexContext {
  // scaleFactor: number;
  requestReflow(): void;
  // registerBox(
  //   node: FlexNode,
  //   group: Group,
  //   flexProps: R3FlexProps,
  //   centerAnchor?: boolean
  // ): BoxesItem | undefined;
  // unregisterBox(node: FlexNode): void;
  // notInitialized?: boolean;
}

const initialSharedFlexContext: RootFlexContext = {
  // scaleFactor: 100,
  requestReflow() {
    console.warn("Flex not initialized! Please report");
  },
  // registerBox() {
  //   console.warn("Flex not initialized! Please report");
  //   return undefined;
  // },
  // unregisterBox() {
  //   console.warn("Flex not initialized! Please report");
  // },
  // notInitialized: true,
};

export const FlexContext = createContext<RootFlexContext>(initialSharedFlexContext);

export interface BoxContext {
  node: FlexNode | null;
  size: [number, number, number, number];
  centerAnchor?: boolean;
  notInitialized?: boolean;
}

const initialSharedBoxContext: BoxContext = {
  node: null,
  size: [0, 0, 0, 0],
  notInitialized: true,
};

export const BoxContext = createContext<BoxContext>(initialSharedBoxContext);

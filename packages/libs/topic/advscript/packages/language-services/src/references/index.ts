import { Linker } from "./linker";
import { NameProvider } from "./nameing";
import { References } from "./references";
import { ScopeProvider, ScopeComputation } from "./scope";

export type Providers = {
  Linker: Linker;
  NameProvider: NameProvider;
  ScopeProvider: ScopeProvider;
  ScopeComputation: ScopeComputation;
  References: References;
};

export * from "./linker";
export * from "./nameing";
export * from "./references";
export * from "./scope";

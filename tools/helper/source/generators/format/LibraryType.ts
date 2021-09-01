export enum LibraryType {
  Node = "node",
  Web = "web",
  Other = "other",
  Internal = "internal",
  Shared = "shared",
}

type Keys<T extends readonly any[]> = T[Extract<keyof T, number>];
const sharedLibTypes = ["types", "utils"] as const;
const nodeLibTypes = [...sharedLibTypes, "nest", "fs", "tsconfig"] as const;
const webLibTypes = [
  ...sharedLibTypes,
  "react",
  "vue",
  "vue-next",
  "svelte",
  "inferno",
  "style",
] as const;
const internalLibTypes = [
  ...sharedLibTypes,
  "babel-plugins",
  "rollup-plugins",
  "nx-plugins",
  "ts-transformer",
  "webpack",
  "rollup",
  "docs",
] as const;

export type SharedLibraryType = Keys<typeof sharedLibTypes>;
export type WebLibraryType = Keys<typeof webLibTypes>;
export type NodeLibraryType = Keys<typeof nodeLibTypes>;
export type InternalType = Keys<typeof internalLibTypes>;

export const LibrarySubTypes = {
  [LibraryType.Shared]: sharedLibTypes,
  [LibraryType.Internal]: internalLibTypes,
  [LibraryType.Node]: nodeLibTypes,
  [LibraryType.Web]: webLibTypes,
};
export interface LibrarySubTypes {
  [LibraryType.Shared]?: SharedLibraryType;
  [LibraryType.Internal]?: InternalType;
  [LibraryType.Node]?: NodeLibraryType;
  [LibraryType.Web]?: WebLibraryType;
}
export const SortedLibraryType: LibraryType[] = Object.keys(LibraryType).map(
  (key) => LibraryType[key]
);

export interface LibraryTypeOptions {
  type?: LibraryType | "buildTools";
  "type:shared"?: LibrarySubTypes[LibraryType.Shared];
  "type:buildTools"?: LibrarySubTypes[LibraryType.Internal];
  "type:node"?: LibrarySubTypes[LibraryType.Node];
  "type:web"?: LibrarySubTypes[LibraryType.Web];
}

export function getSubType(
  type: LibraryType
): LibrarySubTypes[Exclude<LibraryType, LibraryType.Other>][] {
  return (
    (type === LibraryType.Shared
      ? LibrarySubTypes[type]
      : LibrarySubTypes[type]?.filter(
          (type: string) => !LibrarySubTypes.shared.includes(type as any)
        )) || []
  );
}

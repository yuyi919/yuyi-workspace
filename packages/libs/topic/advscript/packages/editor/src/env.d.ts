declare module "@adv.ohm" {
  const namespaces: typeof import("../ohm/adv.ohm-bundle").default;
  export default namespaces;
}

declare module "*.adv" {
  const d: string;
  export default d;
}
declare module "@addLibs/*" {
  const d: Record<string, string>;
  export default d;
}

declare module "*.avs" {
  const d: string;
  export default d;
}

declare module "*.ohm" {
  const template: import("ohm-js").Namespace;
  export default template;
}

declare module "*.adv" {
  const document: string;
  export default document;
}
declare module "*.avs" {
  const document: string;
  export default document;
}

declare module "@addLibs/*" {
  const d: Record<string, string>;
  export default d;
}
declare module "monaco-editor/esm/vs/editor/edcore.main.js" {
  export * from "monaco-editor/esm/vs/editor/editor.api";
}

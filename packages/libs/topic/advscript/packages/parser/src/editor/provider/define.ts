declare module "monaco-editor/esm/vs/language/typescript/workerManager" {
  import { Uri } from "monaco-editor";
  import {
    LanguageServiceDefaults,
    TypeScriptWorker,
  } from "monaco-editor/esm/vs/language/typescript/monaco.contribution";

  export class WorkerManager {
    constructor(modeId: string, defaults: LanguageServiceDefaults);
    getLanguageServiceWorker(...resources: Uri[]): Promise<TypeScriptWorker>;
  }
}

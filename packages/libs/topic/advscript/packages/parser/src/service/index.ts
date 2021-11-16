import type { URI as Uri } from "vscode-uri";

export interface IAvsLanguageOptions {}
export abstract class AvsLanguageService {
  constructor(public options: IAvsLanguageOptions) {}

  _onDidChange = new monaco.Emitter<void>();

  get onDidChange() {
    return this._onDidChange.event;
  }

  protected applyChangeEvent() {
    this._onDidChange.fire();
  }

  async getLibFiles() {
    // @ts-ignore
    return (await (await monaco.languages.typescript.getTypeScriptWorker())()).getLibFiles();
  }
}

export interface WorkerAccessor<T> {
  (first: Uri, ...more: Uri[]): Promise<T>;
}

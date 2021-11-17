import { IAvsWorker } from "..";
import { Uri } from "../monaco.export";
import { Editor, editor } from "../monaco.export";

/** Contains all the lib files */
const libFileSet: Record<string, boolean> = {};
export class LibFiles {
  private _libFiles: Record<string, string>;
  private _hasFetchedLibFiles: boolean;
  private _fetchLibFilesPromise: Promise<void> | null;

  constructor(private readonly _worker: (...uris: Uri[]) => Promise<IAvsWorker>) {
    this._libFiles = {};
    this._hasFetchedLibFiles = false;
    this._fetchLibFilesPromise = null;
  }

  public isLibFile(uri: Uri | null): boolean {
    if (!uri) {
      return false;
    }
    if (uri.path.indexOf("/lib.") === 0) {
      return !!libFileSet[uri.path.slice(1)];
    }
    return false;
  }

  public getOrCreateModel(fileName: string): Editor.ITextModel | null {
    const uri = monaco.Uri.parse(fileName);
    const model = editor.getModel(uri);
    if (model) {
      return model;
    }
    if (this.isLibFile(uri) && this._hasFetchedLibFiles) {
      return editor.createModel(this._libFiles[uri.path.slice(1)], "typescript", uri);
    }
    const matchedLibFile = monaco.languages.typescript.typescriptDefaults.getExtraLibs()[fileName];
    if (matchedLibFile) {
      return editor.createModel(matchedLibFile.content, "typescript", uri);
    }
    return null;
  }

  private _containsLibFile(uris: (Uri | null)[]): boolean {
    for (const uri of uris) {
      if (this.isLibFile(uri)) {
        return true;
      }
    }
    return false;
  }

  public async fetchLibFilesIfNecessary(uris: (Uri | null)[]): Promise<void> {
    if (!this._containsLibFile(uris)) {
      // no lib files necessary
      return;
    }
    await this._fetchLibFiles();
  }

  private _fetchLibFiles(): Promise<void> {
    if (!this._fetchLibFilesPromise) {
      this._fetchLibFilesPromise = this._worker()
        .then((w) => w.getLibFiles())
        .then((libFiles) => {
          this._hasFetchedLibFiles = true;
          this._libFiles = libFiles;
        });
    }
    return this._fetchLibFilesPromise;
  }
}

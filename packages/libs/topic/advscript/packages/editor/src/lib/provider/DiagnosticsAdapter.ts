import { monaco, IDisposable } from "../monaco.export";
import { editor, Editor } from "../monaco.export";
import { toDiagnostics } from "../provider/_workerUtils";
import { IWorkerAccessor, AvsLanguageService } from "../../service";

export class DiagnosticsAdapter {
  private _disposables: IDisposable[] = [];
  private _listener: { [uri: string]: IDisposable } = Object.create(null);

  constructor(
    private _languageId: string,
    private _worker: IWorkerAccessor<AvsLanguageService>,
    language: AvsLanguageService
  ) {
    const onModelAdd = (model: monaco.editor.IModel): void => {
      const modeId = model.getLanguageId();
      if (modeId !== this._languageId) {
        return;
      }

      let handle: number;
      this._listener[model.uri.toString()] = model.onDidChangeContent(() => {
        window.clearTimeout(handle);
        handle = window.setTimeout(() => this._doValidate(model.uri, modeId), 500);
      });

      this._doValidate(model.uri, modeId);
    };

    const onModelRemoved = (model: Editor.IModel): void => {
      editor.setModelMarkers(model, this._languageId, []);

      const uriStr = model.uri.toString();
      const listener = this._listener[uriStr];
      if (listener) {
        listener.dispose();
        delete this._listener[uriStr];
      }
    };

    this._disposables.push(editor.onDidCreateModel(onModelAdd));
    this._disposables.push(editor.onWillDisposeModel(onModelRemoved));
    this._disposables.push(
      editor.onDidChangeModelLanguage((event) => {
        onModelRemoved(event.model);
        onModelAdd(event.model);
      })
    );

    language.onDidChange((_) => {
      editor.getModels().forEach((model) => {
        if (model.getLanguageId() === this._languageId) {
          onModelRemoved(model);
          onModelAdd(model);
        }
      });
    });

    this._disposables.push({
      dispose: () => {
        for (const key in this._listener) {
          this._listener[key].dispose();
        }
      },
    });

    editor.getModels().forEach(onModelAdd);
  }

  public dispose(): void {
    this._disposables.forEach((d) => d && d.dispose());
    this._disposables = [];
  }

  private _doValidate(resource: monaco.Uri, languageId: string): void {
    this._worker(resource)
      .then((worker) => {
        return worker.doValidation(resource.toString());
      })
      .then((diagnostics) => {
        const markers = diagnostics.map((d) => toDiagnostics(resource, d));
        const model = editor.getModel(resource);
        if (model && model.getLanguageId() === languageId) {
          editor.setModelMarkers(model, languageId, markers);
        }
      })
      .then(undefined, (err) => {
        console.error(err);
      });
  }
}

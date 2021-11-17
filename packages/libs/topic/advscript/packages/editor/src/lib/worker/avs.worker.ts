import * as edworker from "monaco-editor/esm/vs/editor/editor.worker";
import type { worker } from "../monaco.export";
import { AvsWorker, ISetupConfig } from "./avsWorker";
self.onmessage = function (e) {
  // _worker.postMessage(e.data)
  // ignore the first message
  edworker.initialize((ctx: worker.IWorkerContext, createData: ISetupConfig) => {
    return new AvsWorker(ctx, createData);
  });
};

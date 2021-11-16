// @ts-ignore
import * as edworker from "monaco-editor/esm/vs/editor/editor.worker";
import { AvsWorker, ISetupConfig } from "./avsWorker";
import type { worker } from "../monaco.export";

console.log("preload worker");
self.onmessage = function () {
  // ignore the first message
  edworker.initialize((ctx: worker.IWorkerContext, createData: ISetupConfig) => {
    return new AvsWorker(ctx, createData);
  });
};

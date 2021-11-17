import { Uri, editor } from "../monaco.export";
import { setupWorkerUrl } from "../hackMonaco";
import type { AvsWorker as IAvsWorker } from "./avsWorker";
import createWorker from "./avs.worker?worker&inline";

const languageLabel = "advscript";
setupWorkerUrl(languageLabel, createWorker);

let worker: editor.MonacoWebWorker<IAvsWorker>;
export async function getWorker() {
  if (!worker) {
    console.log("createWorker");
    worker = editor.createWebWorker<IAvsWorker>({
      // module that exports the create() method and returns a `TypeScriptWorker` instance
      moduleId: "advscript",

      label: languageLabel,

      keepIdleModels: true,

      // passed in to the create() method
      createData: {},
    });
  }
  const instance = await worker.getProxy();
  // eslint-disable-next-line @typescript-eslint/ban-types
  return instance; // (Worker as Function)();
}

export async function getLanguageServiceWorker(...resources: Uri[]): Promise<IAvsWorker> {
  const client = await getWorker();
  if (worker) {
    return worker.withSyncedResources(resources);
  }
  return client;
}

export type { IAvsWorker };

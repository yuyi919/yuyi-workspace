import { Uri, editor } from "../monaco.export";
import { setupWorkerUrl } from "../hackMonaco";
import type { AvsWorker as IAvsWorker } from "./avsWorker";
import url from "./avs.amd.worker?url";
import plainWorkerUrl from "./avsWorker?url";

// export async function getWorker() {
//   const { default: Worker } = await import("./avs.worker?worker");

//   // eslint-disable-next-line @typescript-eslint/ban-types
//   return (Worker as Function)();
// }

export type { IAvsWorker };

const languageLabel = "advscript";
setupWorkerUrl(languageLabel, url);

let worker: editor.MonacoWebWorker<IAvsWorker>;
export async function getWorker() {
  // const { default: Worker } = await import("./avs.worker?worker");
  worker = editor.createWebWorker<IAvsWorker>({
    // module that exports the create() method and returns a `TypeScriptWorker` instance
    moduleId: plainWorkerUrl,

    label: languageLabel,

    keepIdleModels: true,

    // passed in to the create() method
    createData: {},
  });
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

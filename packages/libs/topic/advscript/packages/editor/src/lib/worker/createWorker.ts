import { setupWorkerUrl } from "../hackMonaco";
import createWorker from "./avs.worker?worker&inline";

const languageLabel = "advscript";
setupWorkerUrl(languageLabel, createWorker);

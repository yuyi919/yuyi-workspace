import { AvsLanguageService, IAvsLanguageOptions } from "../language";
import type { worker } from "../monaco.export";
export interface ISetupConfig extends IAvsLanguageOptions {}
export class AvsWorker extends AvsLanguageService {
  constructor(public ctx: worker.IWorkerContext, public options: ISetupConfig) {
    super(options);
    console.log("AvsWorker", this);
  }
  async getScriptVersion(fileName: string) {
    return "1";
  }
}

export function create(ctx: worker.IWorkerContext, createData: ISetupConfig): AvsWorker {
  return new AvsWorker(ctx, createData);
}

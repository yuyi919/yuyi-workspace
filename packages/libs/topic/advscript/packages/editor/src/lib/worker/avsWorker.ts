import { AvsLanguageService, IAvsLanguageOptions } from "../../service";
import type { worker } from "../monaco.export";
export interface ISetupConfig extends IAvsLanguageOptions {}
export class AvsWorker extends AvsLanguageService {
  constructor(public ctx: worker.IWorkerContext, public options: ISetupConfig) {
    super({
      ...options,
      monaco,
    });
    console.log("AvsWorker", this, {
      ...options,
      monaco,
      self,
    });
  }
  async getScriptVersion(uri: string) {
    return 1;
  }
}

export function create(ctx: worker.IWorkerContext, createData: ISetupConfig): AvsWorker {
  return new AvsWorker(ctx, createData);
}

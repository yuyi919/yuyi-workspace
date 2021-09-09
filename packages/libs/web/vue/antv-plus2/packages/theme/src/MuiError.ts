import { sprintf } from "./sprintf";

export class MuiError extends Error {
  constructor(message: string, ...args: any[]) {
    super(sprintf(message, ...args));
  }
}

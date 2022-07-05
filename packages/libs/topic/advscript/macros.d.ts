declare module "@logger" {
  export type Message = string | any;
  /* coloize console.log() */
  export function log(message?: any, ...args: any[]): void;
  /* coloize console.time() */
  export function time(label: string, ...args: any[]): void;
}
declare module "@logger-helper" {}

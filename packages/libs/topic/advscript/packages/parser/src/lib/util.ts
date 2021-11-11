export function printError(error: Error) {
  console.error("%c" + error.stack, "font-family: monospace; font-size: 13px;font-style: normal;");
}

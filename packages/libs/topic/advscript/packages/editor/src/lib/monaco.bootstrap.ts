export async function getMonaco() {
  // if (import.meta.env.PROD) {
    await import("./monaco.all");
    return import("./monaco.export");
  // } else {
  //   return import("./monaco.bundle");
  // }
}

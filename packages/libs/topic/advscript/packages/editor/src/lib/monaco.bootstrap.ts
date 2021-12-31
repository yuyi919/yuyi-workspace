export async function getMonaco() {
  await import("./monaco.all");
  return import("./monaco.export");;
}

import { SystemLoader, loadResources, ResourceIds } from "./SystemLoader";

export async function load() {
  for await (const item of loadResources(ResourceIds.DialogJson)) {
    console.log(item);
  }
  console.log(SystemLoader);
  await import("./dev")
}

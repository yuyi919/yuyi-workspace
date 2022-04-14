import { SystemLoader, loadResources, ResourceIds } from "./SystemLoader";

export async function load() {
  for await (const item of loadResources(
    ResourceIds.DialogJson,
    {
      name: "fonts",
      url: "../fonts/font.css"
    },
    {
      name: "SystemSE_Cursor",
      url: "../audio/se/bsd/SystemSE_Cursor.ogg"
    },
    {
      name: "SystemSE_MainMenu",
      url: "../audio/se/bsd/SystemSE_MainMenu.ogg"
    }
  )) {
    console.debug(item);
  }
  console.log(SystemLoader);
  await import("./dev");
}

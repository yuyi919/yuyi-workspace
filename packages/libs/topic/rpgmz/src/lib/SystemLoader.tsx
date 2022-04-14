import "./sound";
import { is } from "@yuyi919/shared-types";
import * as PIXI from "pixi.js";
import { WebfontLoaderPlugin } from "pixi-webfont-loader";
PIXI.Loader.registerPlugin(WebfontLoaderPlugin);

export const SystemLoader = new PIXI.Loader("/public");
export enum ResourceIds {
  DialogJson = "system.json",
  DialogFrame = "dialog/frame.png",
  DialogBack = "dialog/back.png",
  InfoWindowFrame1 = "infoWindow/frame_1.png",
  InfoWindowFrame2 = "infoWindow/frame_2.png",
  InfoWindowFrame = "infoWindow/frame.png",
  InfoWindowBack = "infoWindow/back.png",
  SetupMenuBarBack = "mainMenu/bar_back.png",
  SetupMenuFlash = "mainMenu/flash.png",
  SetupMenuMainBtn1 = "mainMenu/main_btn1.png",
  SetupMenuMainBtn2 = "mainMenu/main_btn2.png",
  SetupMenuMainBtn3 = "mainMenu/main_btn3.png",
  SetupMenuMainBtn4 = "mainMenu/main_btn4.png",
  SetupMenuMainBtn5 = "mainMenu/main_btn5.png",
  SetupMenuMainBtn6 = "mainMenu/main_btn6.png"
}

export enum FontFamily {
  Transistor = "Transistor",
  ChakraPetch = "Chakra Petch",
  ProFontForPowerline = "ProFont For Powerline"
  // Transistor = "Transistor",
  // Transistor = "Transistor",
  // Transistor = "Transistor"
}

export interface Loaded {
  path: string;
  name: string;
  texture: PIXI.Texture;
  data: any;
}

export function loadWithResource(
  res: PIXI.LoaderResource | string
): Generator<Pick<Loaded, "name" | "texture">>;
export function loadWithResource(
  res: PIXI.LoaderResource | string,
  fileName?: string
): PIXI.Texture;
export function loadWithResource(res: PIXI.LoaderResource | string, fileName?: string) {
  if (is.str(res)) {
    res = SystemLoader.resources[res];
    if (!res) {
      throw Error("目标资源文件不存在！");
    }
  }
  if (is.str(fileName)) {
    const result = res.textures[fileName];
    if (result) return result;
    throw Error("目标文件在该资源中不存在！");
  }
  return _loadWithResource(res);
}
function* _loadWithResource(res: PIXI.LoaderResource) {
  for (const frameName in res.textures) {
    yield {
      name: frameName,
      texture: res.textures[frameName]
    };
    // console.log(res[resPath], frames.textures?.[frameName]);
    // console.log(res[resPath], PIXI.Texture.from(frames[frameName]));
  }
}
export type LoadResource = { name: string; url: string };
export async function* loadResources(..._path: (string | LoadResource)[]) {
  const path = _path.map((o) =>
    typeof o === "string" ? { name: o, url: o } : o
  ) as LoadResource[];
  await new Promise<void>((resolve) => {
    const load = path.filter((o) => !SystemLoader.resources[o.name]);
    if (load.length) {
      console.log("load", load);
      load
        .reduce((SystemLoader, load) => SystemLoader.add(load), SystemLoader)
        .load((r, res) => {
          resolve();
        });
    } else resolve();
  });
  for (const { name: resPath } of path) {
    const l = SystemLoader.resources[resPath];
    if (l)
      for (const { name, texture } of loadWithResource(l)) {
        yield { name, texture, path: resPath, data: l.data.frames[name] } as Loaded;
      }
  }
}

import { is } from "@yuyi919/shared-types";
import * as PIXI from "pixi.js";

export const SystemLoader = new PIXI.Loader("/public");

export enum ResourceIds {
  DialogJson = "dialog.json",
  DialogFrame = "dialog_frame.png",
  DialogBack = "dialog_back.png",
  InfoWindowFrame1 = "frame_1.png",
  InfoWindowFrame2 = "frame_2.png",
  InfoWindowFrame = "window_frame.png",
  InfoWindowBack = "window_back.png"
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
export async function* loadResources(...path: string[]) {
  await new Promise<void>((resolve) => {
    const load = path.filter((o) => !SystemLoader.resources[o]);
    if (load.length) {
      console.log("load", load);
      SystemLoader.add(...load).load((r, res) => {
        resolve();
      });
    } else resolve();
  });
  for (const resPath of path) {
    const l = SystemLoader.resources[resPath];
    for (const { name, texture } of loadWithResource(l)) {
      yield { name, texture, path: resPath, data: l.data.frames[name] } as Loaded;
    }
  }
}

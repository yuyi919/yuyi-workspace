import { is } from "@yuyi919/shared-types";

export const SystemLoader = new PIXI.Loader("/public");

export enum ResourceIds {
  DialogJson = "dialog.json",
  DialogFrame = "dialog_frame.png",
  DialogBack = "dialog_back.png"
}

export interface Loaded {
  path: string;
  name: string;
  texture: PIXI.Texture;
  data: any;
}

export function* loadWithResource(res: PIXI.LoaderResource | string) {
  if (is.str(res)) {
    res = SystemLoader.resources[res];
  }
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

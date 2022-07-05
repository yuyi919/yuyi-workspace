/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable prefer-const */
import { env } from "./env";
import { IUpdataDataRecord, PfvTree } from "./FavoriteTree";
import * as layertree from "./layertree";
import * as renderer from "./renderer";

export interface LoadedCache {
  name: string;
  psd: psd.Root;
  pfv?: ArrayBuffer;
}

export function dataURLtoBlob(dataurl: string) {
  let arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)![1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
export class PsdStoreLoader {
  psdRoot: psd.Root;
  normalModeState: string;
  favorite: PfvTree = new PfvTree();
  dataUrl: string;

  dataURLtoBlob = dataURLtoBlob;

  constructor(
    public canvas: HTMLCanvasElement | ((width: number, height: number, blob: Blob) => any),
    public option: {
      autoTrim?: boolean;
      maxPixels?: number;
      fixedSide?: "w" | "h";
      flipX?: boolean;
      flipY?: boolean;
      safeMode?: boolean;
    },
    public list: HTMLUListElement
  ) {
    this.favorite.jst.onChange = (node) => {
      if (node) {
        this.incrementRender(node.data!.value, this.favorite.getFirstFilter(node));
      } else {
        this.fullRender();
      }
    };
  }
  public static async preload(psdUrl: string, pfvUrl?: string) {
    const preloaded = PsdStore.preloaded[psdUrl];
    if (preloaded) {
      return new Promise<LoadedCache>((resolve) => {
        resolve(preloaded);
      });
    }
    function log(p: number) {
      // console.log(p, "Receiving file...");
    }
    const [psdObj, pfvObj] = await Promise.all([
      PsdStore.loadAsBlobFromString(log, psdUrl),
      pfvUrl && PsdStore.loadAsBlobFromString(log, pfvUrl)
    ]);
    const [psd, pfv] = await Promise.all([
      this.loadPsd(psdObj, log),
      pfvObj
        ? new Promise<ArrayBuffer>((resolve) => {
            const fr = new FileReader();
            fr.onload = (e) => {
              // console.log(fr.result);
              resolve(fr.result as ArrayBuffer);
            };
            fr.readAsArrayBuffer(pfvObj.buffer);
          })
        : void 0
    ]);

    return (PsdStore.preloaded[psdUrl] = {
      name: psdObj.name,
      psd: psd,
      pfv: pfv!
    });
  }
  public async loadWith(psdUrl: string, pfvUrl?: string) {
    const { psd, pfv } = await PsdStoreLoader.preload(psdUrl, pfvUrl);
    if (pfv) {
      this.favorite.loadFromArrayBuffer(pfv);
    }
    this.psdRoot = psd;
    this.loadLayerTree(psd);
    this.loadRenderer(psd);
    this.option.maxPixels =
      this.option.maxPixels ??
      (this.option.autoTrim ? this.renderer.Height : this.renderer.CanvasHeight);

    // this.option.seqDlPrefix = name;
    // this.option.seqDlNum = "0";
    // this.redraw();
    this.normalModeState = this.layerRoot.serialize(true);

    // this.leaveReaderMode()
    this.fullRender();
  }

  _currentBlob?: Blob;

  favOp(data: IUpdataDataRecord) {
    this.favorite.jst.updateData(data);
  }

  _opStore = new Map<string, boolean>();
  layerOp(match: string, visible = false) {
    const { layerRoot, _opStore } = this;
    for (const key in layerRoot.nodes) {
      const node = layerRoot.nodes[key];
      if (node.name === match) {
        if (node.checked !== visible) {
          if (_opStore.get(match) === !visible) {
            _opStore.delete(match);
          } else {
            _opStore.set(match, visible);
          }
          node.checked = visible;
        }
      }
    }
    this.redraw();
  }

  batchLayerOp(layers: Record<string, boolean>) {
    for (const match in layers) {
      const visible = layers[match];
      const { layerRoot, _opStore } = this;
      for (const key in layerRoot.nodes) {
        const node = layerRoot.nodes[key];
        if (node.name === match) {
          if (node.checked !== visible) {
            if (_opStore.get(match) === !visible) {
              _opStore.delete(match);
            } else {
              _opStore.set(match, visible);
            }
            node.checked = visible;
          }
        }
      }
    }
    this.redraw();
  }

  get hash() {
    const op = Array.from(this._opStore.entries());
    const fav = this.favorite.getActive().map((node) => node.parent + ":" + node.id);
    // console.debug("option:", this.option);
    // console.debug("operator:", op);
    // console.debug("fav:", fav);
    return JSON.stringify({
      ...this.option,
      fav,
      op
    });
  }

  prevHash: string = "";

  _hashMap: Record<string, { width: number; height: number; blob: Blob }> = {};

  _redraw: number;

  public redraw(): void {
    // console.log("redraw")
    clearTimeout(this._redraw);
    this._redraw = setTimeout(() => {
      env.DEV && console.debug("redraw");
      // this.seqDl.disabled = true;
      const str = this.hash;
      if (str !== this.prevHash) {
        this.render((progress, canvas) => {
          // this.previewBackground.style.width = canvas.width + "px";
          // this.previewBackground.style.height = canvas.height + "px";
          // this.seqDl.disabled = progress !== 1;
          // this.previewCanvas.draggable = progress === 1;

          const handle = this.canvas;
          if (handle instanceof Function) {
            if (this._hashMap[str]) {
              env.DEV && console.debug("load from cache", JSON.parse(str));
              const { width, height, blob } = this._hashMap[str];
              handle(width, height, (this._currentBlob = blob!));
            } else {
              // canvas.toDataURL();
              env.DEV && console.debug("load from render", JSON.parse(str));
              // console.time("toBlob");
              // console.log(dl.length);/
              this.dataUrl = canvas.toDataURL();
              const blob = dataURLtoBlob(this.dataUrl);
              // localStorage.setItem("test", canvas.toDataURL());
              // canvas.toBlob((blob: Blob) => {
              // console.timeEnd("toBlob");
              const { width, height } = canvas;
              this._hashMap[str] = {
                width,
                height,
                blob
              };
              // if (blob) {
              handle(width, height, (this._currentBlob = blob!));
              // }
              // });
            }
          } else {
            setTimeout(() => {
              handle.width = canvas.width;
              handle.height = canvas.height;
              const ctx = handle.getContext("2d");
              if (!ctx) {
                throw new Error("cannot get CanvasRenderingContext2D");
              }
              ctx.drawImage(canvas, 0, 0);
            }, 0);
          }
        });
        // console.log("update", str);
        this.prevHash = str;
        this.layerRoot.updateClass();
      } else {
        const handle = this.canvas;
        if (handle instanceof Function) {
          const { width, height, blob } = this._hashMap[str];
          handle(width, height, (this._currentBlob = blob!));
        }
      }
    }, 21);
  }

  private fullRender() {
    for (const n of this.favorite.getActive()) {
      if (n.data) {
        this.layerRoot.deserializePartial(undefined, n.data.value, this.favorite.getFirstFilter(n));
      }
    }
    this.redraw();
  }
  private incrementRender(state: string, filter?: string): void {
    if (!filter) {
      this.layerRoot.deserialize(state);
    } else {
      this.layerRoot.deserializePartial(void 0, state, filter);
    }
    this.redraw();
    this.normalModeState = "";
  }

  private static async loadPsd(
    obj: { buffer: ArrayBuffer | Blob; name: string },
    progress: (progress: number) => void
  ) {
    const psd = await new Promise<psd.Root>((resolve, reject) => {
      PSD.parseWorker(obj.buffer, progress, resolve, reject);
    });

    return psd;
  }

  save(filename: string): void {
    if (this.canvas instanceof HTMLCanvasElement) {
      PsdStore.canvasToBlob(this.canvas).then((blob) => {
        saveAs(blob, filename);
      });
    } else if (this._currentBlob) {
      saveAs(this._currentBlob, filename);
    }
  }

  private layerRoot: layertree.LayerTree;
  private renderer: renderer.Renderer;

  private loadLayerTree(psd: psd.Root): void {
    // if (!this.layerTree) {
    //   this.initLayerTree();
    // }
    this.layerRoot = new layertree.LayerTree(this.option.safeMode || false, this.list, psd);
  }
  private loadRenderer(psd: psd.Root): void {
    this.renderer = new renderer.Renderer(psd);
    const lNodes = this.layerRoot.nodes;
    const rNodes = this.renderer.nodes;

    for (let key in rNodes) {
      // console.log(lNodes[key].checked, lNodes[key])
      if (!rNodes.hasOwnProperty(key)) {
        continue;
      }
      ((r: renderer.Node, l: layertree.Node) => {
        r.getVisibleState = () => l.checked;
      })(rNodes[key], lNodes[key]);
    }
  }
  private render(callback: (progress: number, canvas: HTMLCanvasElement) => void): void {
    const autoTrim = this.option.autoTrim!;
    const w = autoTrim ? this.renderer.Width : this.renderer.CanvasWidth;
    const h = autoTrim ? this.renderer.Height : this.renderer.CanvasHeight;
    const px = this.option.maxPixels!;
    let scale = 1;
    if (typeof px === "number") {
      switch (this.option.fixedSide) {
        case "w":
          if (w > px) {
            scale = px / w;
          }
          break;
        case "h":
          if (h > px) {
            scale = px / h;
          }
          break;
      }
      if (w * scale < 1 || h * scale < 1) {
        if (w > h) {
          scale = 1 / h;
        } else {
          scale = 1 / w;
        }
      }
    }
    let ltf: layertree.FlipType;
    let rf: renderer.FlipType;
    if (this.option.flipX) {
      if (this.option.flipY) {
        ltf = layertree.FlipType.FlipXY;
        rf = renderer.FlipType.FlipXY;
      } else {
        ltf = layertree.FlipType.FlipX;
        rf = renderer.FlipType.FlipX;
      }
    } else {
      if (this.option.flipY) {
        ltf = layertree.FlipType.FlipY;
        rf = renderer.FlipType.FlipY;
      } else {
        ltf = layertree.FlipType.NoFlip;
        rf = renderer.FlipType.NoFlip;
      }
    }
    // if (this.temp.flip !== ltf) {
    //   this.temp.flip = ltf;
    // }
    if (this.layerRoot.flip !== ltf) {
      this.layerRoot.flip = ltf;
    }
    this.renderer.render(scale, autoTrim, rf, callback);
  }
  // temp = {
  //   flip: layertree.FlipType.NoFlip
  // };
}

export class PsdStore {
  static preloaded: Record<string, LoadedCache> = {};
  static canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if ("toBlob" in canvas) {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
            return;
          }
          reject("could not get Blob");
        });
        return;
      }
      const bin = atob(canvas.toDataURL().split(",")[1]);
      const buf = new Uint8Array(bin.length);
      for (let i = 0, len = bin.length; i < len; ++i) {
        buf[i] = bin.charCodeAt(i);
      }
      resolve(new Blob([buf], { type: "image/png" }));
    });
  }

  static normalizeNumber(s: string): string {
    return s.replace(/[\uff10-\uff19]/g, (m): string => {
      return (m[0].charCodeAt(0) - 0xff10).toString();
    });
  }

  static loadAsBlobCrossDomain(
    progress: (progress: number) => void,
    url: string
  ): Promise<{ buffer: Blob; name: string }> {
    return new Promise<{ buffer: Blob; name: string }>((resolve, reject) => {
      if (location.protocol === "https:" && url.substring(0, 5) === "http:") {
        return reject(new Error("cannot access to the insecure content from HTTPS."));
      }
      const ifr = document.createElement("iframe");
      let port: MessagePort | undefined;
      let timer = setTimeout(() => {
        if (port) {
          port.onmessage = undefined as any;
        }
        document.body.removeChild(ifr);
        return reject(new Error("something went wrong"));
      }, 20000) as unknown as number;
      ifr.setAttribute("sandbox", "allow-scripts allow-same-origin");
      ifr.onload = (e) => {
        const msgCh = new MessageChannel();
        port = msgCh.port1;
        port.onmessage = (e) => {
          if (timer) {
            clearTimeout(timer);
            timer = 0;
          }
          if (!e.data || !e.data.type) {
            return;
          }
          switch (e.data.type) {
            case "complete":
              document.body.removeChild(ifr);
              if (!e.data.data) {
                reject(new Error("something went wrong"));
                return;
              }
              progress(1);
              resolve({
                buffer: e.data.data,
                name: e.data.name ? e.data.name : this.extractFilePrefixFromUrl(url)
              });
              return;
            case "error":
              document.body.removeChild(ifr);
              reject(new Error(e.data.message ? e.data.message : "could not receive data"));
              return;
            case "progress":
              if ("loaded" in e.data && "total" in e.data) {
                progress(e.data.loaded / e.data.total);
              }
              return;
          }
        };
        if (!ifr.contentWindow) {
          reject(new Error("contentWindow not found in the iframe"));
          return;
        }
        ifr.contentWindow.postMessage(
          location.protocol,
          url.replace(/^([^:]+:\/\/[^\/]+).*$/, "$1"),
          [msgCh.port2]
        );
      };
      ifr.src = url;
      ifr.style.display = "none";
      document.body.appendChild(ifr);
    });
  }

  static async loadAsBlobFromString(
    progress: (progress: number) => void,
    url: string
  ): Promise<{ buffer: Blob; name: string }> {
    if (url.substring(0, 3) === "xd:") {
      return await this.loadAsBlobCrossDomain(progress, url.substring(3));
    }
    return new Promise<{ buffer: Blob; name: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.responseType = "blob";
      xhr.onload = (e) => {
        progress(1);
        if (xhr.status === 200) {
          resolve({
            buffer: xhr.response,
            name: this.extractFilePrefixFromUrl(url)
          });
          return;
        }
        reject(new Error(xhr.status + " " + xhr.statusText));
      };
      xhr.onerror = (e) => {
        console.error(e);
        reject(new Error("could not receive data"));
      };
      xhr.onprogress = (e) => progress(e.loaded / e.total);
      xhr.send(null);
    });
  }
  static loadAsBlob(
    progress: (progress: number) => void,
    file_or_url: File | string
  ): Promise<{ buffer: ArrayBuffer | Blob; name: string }> {
    if (!(file_or_url instanceof File)) {
      return this.loadAsBlobFromString(progress, file_or_url);
    }
    return new Promise<{ buffer: ArrayBuffer | Blob; name: string }>((resolve) => {
      resolve({
        buffer: file_or_url,
        name: file_or_url.name.replace(/\..*$/i, "") + "_"
      });
    });
  }

  static cleanForFilename(f: string): string {
    // eslint-disable-next-line no-control-regex
    return f.replace(/[\x00-\x1f\x22\x2a\x2f\x3a\x3c\x3e\x3f\x7c\x7f]+/g, "_");
  }

  static formateDate(d: Date): string {
    let s = d.getFullYear() + "-";
    s += ("0" + (d.getMonth() + 1)).slice(-2) + "-";
    s += ("0" + d.getDate()).slice(-2) + " ";
    s += ("0" + d.getHours()).slice(-2) + ":";
    s += ("0" + d.getMinutes()).slice(-2) + ":";
    s += ("0" + d.getSeconds()).slice(-2);
    return s;
  }

  static extractFilePrefixFromUrl(url: string): string {
    url = url.replace(/#[^#]*$/, "");
    url = url.replace(/\?[^?]*$/, "");
    url = url.replace(/^.*?([^\/]+)$/, "$1");
    url = url.replace(/\..*$/i, "") + "_";
    return url;
  }
}

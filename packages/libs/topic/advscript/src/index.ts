/* eslint-disable eqeqeq */
/* eslint-disable guard-for-in */
// import { log } from "@logger";
import { dataURLtoBlob, PfvRenderer } from "@yuyi919/psdtool-renderer";
import { bind, proxyStaticMethod } from "@yuyi919/shared-utils";
import "./index.css";
import { parse, shouldParseFile } from "./parser";
import { defineMasterTag } from "./tyrano-util";
import { createLogger } from "./createLogger";

const store = {};
function loadRenderer(pm: any): PfvRenderer {
  let renderer = store[pm.name];
  if (!renderer) {
    store[pm.name] = renderer = $(
      `<c-psd-renderer data-chara="${pm.name}" src="${pm.psd}"
            ${pm.height ? `maxsize="${pm.height}"` : ""} />`
    )[0];
    $("body").append(renderer);
  }
  return renderer;
}

export function loadCustomPlugins($: JQueryStatic, TYRANO: ITyrano, object: any) {
  const logger = createLogger(() => "test-app");
  globalThis.logger = logger;
  proxyStaticMethod(TYRANO.kag.ftag.master_tag.chara_show, "start", (target, handle, pm) => {
    logger.groupCollapsed("chara_show:%o", pm);
    logger.banner("chara_show!");
    logger.log("chara_show!");
    logger.info("chara_show!");
    logger.warn("chara_show!");
    logger.error("chara_show!");
    logger.success("chara_show!");
    logger.debug("chara_show!");
    logger.trace("chara_show!");
    logger.errorTrack(new Error("test"));
    logger.groupEnd()();
    if (pm.set) {
      try {
        if (pm.wait == "false") {
          target.kag.ftag.startTag("chara_part", {
            name: pm.name,
            set: pm.set,
            time: "0"
          });
        } else {
          target.kag.ftag.startTag("chara_part", pm);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return handle(pm);
  });
  defineMasterTag(
    "chara_face_psd",
    {
      name: "",
      face: "",
      height: "",
      psd: ""
    },
    {
      async start(pm) {
        // console.time("test");
        const pmKey = JSON.stringify(pm);
        const blobUrl = localStorage.getItem(pmKey)
          ? URL.createObjectURL(dataURLtoBlob(localStorage.getItem(pmKey)))
          : await new Promise((resolve) => {
              const renderer = loadRenderer(pm);
              renderer.addEventListener(
                "change",
                (e) => {
                  // console.timeEnd("test");
                  // resolve(e)
                  localStorage.setItem(pmKey, renderer.loader.dataUrl);
                  resolve(renderer.value);
                },
                { once: true }
              );
            });
        // return new Promise(resolve => {
        this.kag.ftag.startTag("chara_update", {
          ...pm,
          storage: blobUrl
        });
        this.kag.ftag.startTag("chara_face", {
          name: pm.name,
          face: pm.face,
          storage: blobUrl
        });
        // })
      }
    }
  );
  defineMasterTag(
    "chara_update",
    {
      name: "",
      jname: "",
      storage: "",
      face: "",
      top: 0,
      left: 0
    },
    {
      start(pm) {
        // log("test", pm);
        const { storage, name, top, left, jname } = pm;
        const {
          charas: { [name]: chara }
        } = this.kag.stat;
        const face = pm.face || "default";
        const originPosStore = chara.origin_pos || (chara.origin_pos = {});
        const originPos = originPosStore[face] || (originPosStore[face] = {});
        if (top) {
          originPos.top = top;
        }
        if (left) {
          originPos.left = left;
        }
        if (storage) {
          chara.map_face.default = storage;
          chara.storage = storage;
        }
        //キャラクターの日本語名とnameを紐付けるための処置
        if (jname != "") {
          this.kag.stat.jcharas[jname] = name;
          chara.jname = jname;
        }
        this.kag.ftag.nextOrder();
      }
    }
  );
  defineMasterTag(
    "layerOpt",
    {
      layer: "",
      page: "fore",
      visible: "" as "true" | "false" | "",
      left: -1,
      top: -1,
      opacity: -1,
      autohide: false,
      index: 10,
      wait: false,
      time: 600,
      continue: true
    },
    {
      start: async function (pm) {
        if (pm.layer === "message") {
          pm.layer = this.kag.stat.current_layer;
          pm.page = this.kag.stat.current_page;
        }

        console.log(pm);
        let j_layer = this.kag.layer.getLayer(pm.layer, pm.page);

        if (pm.layer === "fix" || pm.layer === "fixlayer") {
          j_layer = $("#tyrano_base").find(".fixlayer");
        }

        //レイヤのポジション指定

        if (pm.left > -1) {
          j_layer.css("left", pm.left);
        }

        if (pm.top > -1) {
          j_layer.css("top", pm.top);
        }

        let opacity;
        if (pm.opacity > -1) {
          opacity = $.convertOpacity(pm.opacity);
          j_layer.css("opacity", $.convertOpacity(pm.opacity));
        }

        const changeVisible = pm.visible != "" && pm.visible !== j_layer.attr("l_visible");
        const isWait = changeVisible && this.kag.stat.is_skip !== true && pm.wait && pm.time > 0;

        if (isWait) {
          // this.kag.layer.showEventLayer();
          this.kag.ftag.startTag("wait", { time: pm.time + "" });
          this.kag.ftag.nextOrder();
          console.log("isWait", pm.layer, pm.time);
        } else {
          this.kag.ftag.nextOrder();
          console.log("nextOrder", pm.layer, pm.visible);
        }
        if (changeVisible) {
          const zIndex = j_layer.css("z-index");
          // setTimeout(() => {
          //表示部分の変更
          if (pm.visible == "true") {
            //バックの場合は、その場では表示してはダメ
            if (pm.page == "fore") {
              j_layer.css("display", "");
            }
            // console.log("opacity", j_layer.css("opacity"));
            // console.log("zIndex", zIndex);
            j_layer.css("opacity", 0);
            !(zIndex > 99) && j_layer.css("z-index", 99);
            j_layer.attr("l_visible", "true");
            j_layer.stop(true, true).fadeTo(pm.time, 1, () => {
              if (zIndex !== "auto") {
                j_layer.css("z-index", zIndex || 99);
              }
            });
          } else {
            !(zIndex > 99) && j_layer.css("z-index", 99);
            j_layer.stop(true, true).fadeTo(pm.time, 0, () => {
              if (zIndex !== "auto") {
                j_layer.css("z-index", zIndex || 99);
              }
              j_layer.css("display", "none");
              j_layer.attr("l_visible", "false");
            });
          }
          // }, 200);
        }
      }
    }
  );

  $.loadText = (file_path, callback) => {
    $.ajax({
      url: file_path + "?" + Math.floor(Math.random() * 1000000),
      cache: false,
      async success(text: string) {
        if (file_path?.endsWith(".fountain") || shouldParseFile(file_path)) {
          const transform = await parse(file_path, text);
          console.log("parseScenario", transform);
          return callback(transform);
        }
        callback(text);
      },
      error() {
        // alert("file not found:" + file_path);
        callback("");
      }
    });
  };
}

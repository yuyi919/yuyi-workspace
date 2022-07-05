/* eslint-disable */
import { html, css, LitElement, PropertyValueMap } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { env } from "./env";
import { PsdStoreLoader } from "./utils";

const PfvRendererName = "c-psd-renderer";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement(PfvRendererName)
export class PfvRenderer extends LitElement {
  static elementName = PfvRendererName as typeof PfvRendererName;

  static styles = css`
    :host {
      /* max-height: 100vh; */
      display: inline-block;
    }
    .list {
      display: none;
      /* position: absolute;
      left: 0;
      top: 0;
      width: 300px;
      overflow: auto;*/
    }
    .canvas {
      /* display: none; */
      overflow: auto;
      /* max-height: 100vh; */
    }
  `;
  @property({
    attribute: false,
    type: String,
    converter: (v) => (v != null ? eval(v as string) : v)
  })
  view = true;

  @property({
    attribute: true,
    type: String,
    converter: (v) => (v != null ? eval(v as string) : v),
    reflect: true
  })
  reflect = false;

  @property({
    attribute: true,
    type: String,
    converter: (v) => (v != null ? eval(v as string) : v),
    reflect: true
  })
  reflectY = false;

  @property({
    attribute: true,
    type: String,
    converter: (v) => (v != null ? eval(v as string) : v),
    reflect: true
  })
  autoTrim = true;

  @property({
    reflect: true,
    type: Number
  })
  maxsize: number;
  @property({
    reflect: true
  })
  fixedside: "w" | "h" = "h";

  /**
   * The name to say "Hello" to.
   */
  @property()
  src: string;

  @property()
  pfv: string;

  @query(".canvas")
  input: HTMLCanvasElement;
  @query(".list")
  list: HTMLUListElement;

  loader: PsdStoreLoader;

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    // console.log("firstUpdated", _changedProperties);
    // .then(() => {
    //   console.time("render");
    //   return this.loader.loadWith("/MtU_akane.psd");
    // })
    // .then(() => {
    //   console.timeEnd("render");
    // });
    // this.contentEditable = "false";
    // this.classList.add("ant-tag", "ant-tag-blue");
  }

  @property({
    reflect: true,
    attribute: false,
    noAccessor: true,
    state: true
  })
  width: number;
  @property({
    reflect: true,
    attribute: false,
    noAccessor: true,
    state: true
  })
  height: number;

  _blobMap = new Map<Blob, string>();
  protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (!this.src) return;
    env.DEV && console.debug("updated", _changedProperties);
    if (_changedProperties.has("src") || _changedProperties.has("pfv")) {
      // const handle = this.input!;
      this.loader = new PsdStoreLoader(
        (width, height, blob) => {
          const exsistUrl = this._blobMap.get(blob);
          if (exsistUrl) {
            this.value = exsistUrl;
          } else {
            this.value = this._blobMap.get(blob) || URL.createObjectURL(blob);
            console.debug("change", this.value);
            this._blobMap.set(blob, this.value);
          }
          this.width = width;
          this.height = height;
          // this.setAttribute("data-width", width + "px");
          // this.setAttribute("data-height", height + "px");
          // this.style.width = width + "px";
          // this.style.height = height + "px";
          // this.input.src = this.value;
          const e = new Event("change");
          this.dispatchEvent(e);
          // this.onchange?.(e);
        },
        {},
        this.list!
      );
      this.syncOption();
      this.loader
        .loadWith(
          this.src,
          this.pfv === "none" ? void 0 : this.pfv || this.src.replace(/\.psd$/, ".pfv")
        )
        .then(() => {
          if (this.maxsize === undefined) {
            this.maxsize = this.loader.option.maxPixels!;
          }
        });
    } else if (_changedProperties.size > 0) {
      this.syncOption();
      this.loader.redraw();
    }

    // if (_changedProperties.has("view")) {
    //   // console.log("view", !!Boolean(_changedProperties.get("view")) + "");
    //   if (!this.view) {
    //     requestAnimationFrame(() => {});
    //   }
    //   // this.contentEditable = !!_changedProperties.get("view") + "";
    // }
  }
  syncOption() {
    const options = this.loader.option || {};
    options.flipX = this.reflect;
    options.flipY = this.reflectY;
    options.autoTrim = this.autoTrim;
    options.maxPixels = this.maxsize;
    options.fixedSide = this.fixedside;
  }

  save(filename: string) {
    this.loader.save(filename);
  }
  render() {
    return html`
      <ul class="list"></ul>
      <img class="canvas" />
    `;
  }

  _onInput(e: any) {
    this.value = e.target.value;
  }

  _onInputKeydown(e: KeyboardEvent) {
    if (e.code === "Enter") {
      e.stopPropagation();
      e.preventDefault();
      this._onBlur();
    }
  }

  transform(text: string) {
    return text
      .split("")
      .reduce((r, s) => {
        const last = r[r.length - 1];
        return s === " "
          ? last instanceof Array
            ? (last.push(s), r)
            : [...r, [s]]
          : typeof last === "string"
          ? ((r[r.length - 1] += s), r)
          : [...r, s];
      }, [] as (string | string[])[])
      .map((o) => {
        if (o instanceof Array) {
          const nbsps = o.fill("&nbsp;").join("");
          // console.log(o);
          return html(Object.assign([nbsps], { raw: [nbsps] }) as any);
        }
        return o;
      });
  }

  @property({
    reflect: true,
    attribute: false,
    noAccessor: true,
    state: true
  })
  value: string = "";

  @state()
  error: boolean = false;

  private _onBlur() {
    this.view = true;
  }
  private _onDbClick() {
    this.view = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [PfvRendererName]: PfvRenderer;
  }
}

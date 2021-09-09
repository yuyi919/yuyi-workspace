/* eslint-disable no-return-assign */
import { get, set } from "lodash";
import Vue, { CreateElement, RenderContext, VNode } from "vue";

const explainGet = (o: { [x: string]: any }, k: string | number, d: any) => o[k] || d;
const explainSet = (o: { [x: string]: any }, k: string | number, v: any) => (o[k] = v);

export function hackRender<Instance extends Vue, Functional extends boolean = false>(
  component: { new (...args: any[]): Instance },
  hackNode: (
    vnodes: VNode | VNode[],
    context?: Functional extends false ? Instance : RenderContext,
    h?: CreateElement
  ) => VNode | VNode[],
  isFunctional?: Functional
): { new (...args: any[]): Instance } {
  hackFromVueComponent(component, "render", (render) => {
    if (render instanceof Function) {
      if (isFunctional) {
        return function hackedFunctionalRender(h: CreateElement, ctx: any) {
          const renderer = render(h, ctx);
          return hackNode(renderer, ctx, h);
        };
      }
      return function hackedInstanceRender(this: any, h: CreateElement) {
        const renderer = render.call(this, h, this);
        return hackNode.call(this, renderer, this, h);
      };
    }
    return render;
  });
  return component;
}
export function extendRender<Instance extends Vue, Functional extends boolean = false>(
  component: { new (...args: any[]): Instance },
  hackNode: (
    vnodes: VNode | VNode[],
    context?: Functional extends false ? Instance : RenderContext,
    h?: CreateElement
  ) => VNode | VNode[],
  isFunctional?: Functional
) {
  return hackFromVueComponent(component, "render", (render) => {
    if (render instanceof Function) {
      if (isFunctional) {
        return function hackedFunctionalRender(h: CreateElement, ctx: any) {
          const renderer = render(h, ctx);
          return hackNode(renderer, ctx, h);
        };
      }
      return function hackedInstanceRender(this: any, h: CreateElement) {
        const renderer = render.call(this, h, this);
        return hackNode.call(this, renderer, this, h);
      };
    }
    return render;
  });
}

export function hackFromVueComponent(
  component: any,
  key: string,
  hack?: (v: any) => any,
  getter?: any,
  setter?: any,
  debug?: boolean
): any {
  getter = getter || (key.indexOf(".") > -1 ? get : explainGet);
  setter = setter || (key.indexOf(".") > -1 ? set : explainSet);
  if (component) {
    let r = getter(component, key);
    if (r) {
      if (hack) {
        const hr = hack(r);
        hr && hr !== r && setter(component, key, hr || r);
      }
    } else if (component.mixins instanceof Array) {
      for (const mixin of component.mixins) {
        if (mixin && !!(r = hackFromVueComponent(mixin, key, hack, getter, setter, debug))) {
          debug && console.log("from mixins", r);
          return r;
        }
      }
    } else if (component.extends) {
      if ((r = hackFromVueComponent(component.extends, key, hack, getter, setter, debug))) {
        debug && console.log("from mixins", r);
        return r;
      }
    }
    if (!r) {
      for (const skey of ["options"]) {
        if ((r = hackFromVueComponent(component[skey], key, hack, getter, setter, debug))) {
          debug && console.log("from options", r);
          return r;
        }
      }
    }
    debug && r != null && console.log("from source", r);
    return r;
  }
  return null;
}
export function getFromVueComponent(component: any, key: string, debug?: boolean) {
  return hackFromVueComponent(component, key, void 0, void 0, void 0, debug);
}

/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable @typescript-eslint/no-empty-interface */
import "ant-design-vue/es/style.js";
// import "ant-design-vue/es/vc-dialog/assets/index.less";
import "@yuyi919/vue-antv-plus2-theme/index.less";
import {
  reactive,
  defineComponent,
  getCurrentInstance,
  onMounted,
  nextTick,
  ref,
  watch,
} from "vue-demi2";
import { Button, Modal } from "../src";
import { HintFlag } from "../src";
import Demo from "./demo.vue";
import { GridDemo } from "./demos/SmartGrid";
import { ModalDialogDemo } from "./demos/ModalDialog";
import { FormDemo } from "./demos/Form";
// import "../shared/src/env.d";
import { useTransitions, MATERIAL_DEFAULT_THEME } from "../packages/theme/src";
console.log(MATERIAL_DEFAULT_THEME);

export let manager: Modal.ModalManager;
export default defineComponent({
  name: "App",
  setup() {
    useTransitions({});
    const store = reactive({
      closeIcon: (
        <span class={`${"ant-modal"}-close-x`}>
          {<a-icon type="close" theme="outlined" class={`${"ant-modal"}-close-icon`} />}
        </span>
      ),
      prefixCls: "ant-modal",
      visible: false,
      title: "dialog",
      transitionName: "zoom",
      maskTransitionName: "fade",
      footer: "footer",
      centered: false,
      scrollBehavior: "outside",
      maskProps: {
        attrs: {
          "data-key": 1,
        },
      },
      afterClose() {
        // dialog.beforeUnmount();
        console.log("afterClose");
      },
    });
    const dialogData = {
      on: {
        close() {
          console.log("close");
          store.visible = false;
        },
      },
    };
    onMounted(() => {
      // Modal.Dialog
      manager = Modal.ModalManager.getInstance(getCurrentInstance()!.proxy);
      // dialog.mounted();
      // setTimeout(() => {
      //   store.visible = true
      // }, 1000);
      // setTimeout(() => {
      //   store.visible = false
      // }, 2000);
    });
    // dialog.linkWatch();
    const radioOptions = [
      { label: "default", value: { centered: false, scrollBehavior: "outside" } },
      { label: "default+inset", value: { centered: false, scrollBehavior: "inside" } },
      { label: "centered", value: { centered: true, scrollBehavior: "outside" } },
      { label: "centered+inset", value: { centered: true, scrollBehavior: "inside" } },
    ];
    const radio = ref<string>();
    watch(radio, (data) => {
      const find = radioOptions.find((o) => o.label === data)?.value;
      if (find) {
        console.log(store, find);
        store.centered = find.centered;
        store.scrollBehavior = find.scrollBehavior;
      }
    });
    return () => {
      return (
        <>
          <div style={{ width: "80vw", margin: "0 auto" }}>
            {/* {dialog.render()} */}
            <Modal.Dialog props={store} {...dialogData}>
              <a-radio-group
                vModel={{ value: radio.value, callback: (v: any) => (radio.value = v) }}
              >
                {radioOptions.map((o) => (
                  <a-radio value={o.label}>{o.label}</a-radio>
                ))}
              </a-radio-group>
              <div style="height: 1000px"></div>
            </Modal.Dialog>
            <Button
              onClick={() => {
                store.visible = true;
              }}
            >
              点击
            </Button>
            <Button
              type="second"
              size="large"
              ghost
              hint="test"
              onClick={async (e) => {
                const result = await manager.callModal(
                  { title: "测试", placement: "left", confirmSubmit: true, confirmCancel: true },
                  "aaaaaaaaa"
                );
                console.log("result", result); //.log("clicl", e);
              }}
            >
              点击确认
            </Button>
            <Demo title="测试" desc="测试">
              {(["left", "right", "default", "center", "top", "bottom", null] as const).map(
                (placement) => (
                  <Button
                    onClick={() =>
                      manager.callModal(
                        {
                          title: "测试",
                          placement,
                          confirmSubmit: true,
                          confirmCancel: true,
                          confirmClose: true,
                        },
                        () => import("./readme.txt")
                      )
                    }
                  >
                    {placement || "None"}
                  </Button>
                )
              )}
            </Demo>
            <FormDemo />
            {/* <ModalDialogDemo />
          <GridDemo /> */}
          </div>
        </>
      );
    };
  },
});

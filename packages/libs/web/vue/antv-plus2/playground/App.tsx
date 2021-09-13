/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable @typescript-eslint/no-empty-interface */
import "ant-design-vue/es/style.js";
import "@yuyi919/vue-antv-plus2-theme/index.less"
import { defineComponent, getCurrentInstance, onMounted, ref } from "vue-demi2";
import { Button, Modal } from "../src";
import { HintFlag } from "../src"
import Demo from "./demo.vue";
import { GridDemo } from "./demos/SmartGrid";
import { ModalDialogDemo } from "./demos/ModalDialog";
import { FormDemo } from "./demos/Form";
// import "../shared/src/env.d";
import { createMuiTheme } from "../packages/theme/src";

console.log(createMuiTheme({
  mixins: {}
}))

export let manager: Modal.ModalManager;
export default defineComponent({
  name: "App",
  setup() {
    onMounted(() => {
      manager = Modal.ModalManager.getInstance(getCurrentInstance()!.proxy);
    });
    return () => {
      return (
        <div style={{ width: "80vw", margin: "0 auto" }}>
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
      );
    };
  },
});

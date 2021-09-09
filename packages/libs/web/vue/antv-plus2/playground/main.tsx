/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { ConfigProvider, Button, Input, Skeleton, Drawer } from "ant-design-vue";
import { HintFlag } from "../src"
import { createApp } from "vue-demi2";
// @ts-ignore
import zhCN from "ant-design-vue/es/locale/zh_CN";
// import { STATIC_DEFAULT_THEME, useTheme } from "../theme/src/index";
// import App from "./App";

const app = createApp({
  components: { ConfigProvider },
  setup() {
    // useTheme.provide(() =>
    //   Object.assign(STATIC_DEFAULT_THEME, {
    //     // themeConfig: self.$themeConfig,
    //   })
    // );
    return () => {
      return (
        <config-provider locale={zhCN}>
          <HintFlag /><span>1</span>
        </config-provider>
      );
    };
  },
});
app.use(ConfigProvider);
app.use(Button);
app.use(Skeleton);
app.use(Drawer);
app.use(Input)
app.mount("#app");

console.log(app);

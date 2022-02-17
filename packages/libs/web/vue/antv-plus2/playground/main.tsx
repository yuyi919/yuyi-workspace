import "./preset";
/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { Button, ConfigProvider, Drawer, Icon, Input, Radio, Skeleton } from "ant-design-vue";
// @ts-ignore
import zhCN from "ant-design-vue/es/locale/zh_CN";
import { createApp } from "vue-demi2";
// import { STATIC_DEFAULT_THEME, useTheme } from "../theme/src/index";
import App from "./App";

const app = createApp({
  components: { ConfigProvider, App },
  setup() {
    // useTheme.provide(() =>
    //   Object.assign(STATIC_DEFAULT_THEME, {
    //     // themeConfig: self.$themeConfig,
    //   })
    // );
    return () => {
      return (
        <config-provider locale={zhCN}>
          <app />
        </config-provider>
      );
    };
  },
});
app.use(ConfigProvider);
app.use(Button);
app.use(Skeleton);
app.use(Drawer);
app.use(Input);
app.use(Icon);
app.use(Radio);
app.mount("#app");

console.log(app);

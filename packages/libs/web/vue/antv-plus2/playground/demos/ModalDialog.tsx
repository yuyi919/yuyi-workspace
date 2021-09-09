import { Checkbox, Select } from "ant-design-vue";
import { defineComponent, reactive } from "vue-demi2";
import { Button, FormLayout } from "../../src";
import { manager } from "../App";
import Demo from "../demo.vue";
export const ModalDialogDemo = defineComponent({
  setup() {
    const config = reactive({
      type: "confirm" as "confirm" | "alert",
      dangerous: false,
      maskClosable: false,
    });
    return () => {
      return (
        <Demo title="简单对话框" desc="不同图标类型">
          <FormLayout layout="horizontal" labelWidth={200}>
            <FormLayout.Item feedbackStatus="pending" label="弹出框类型">
              <Select
                vModel={{
                  value: config.type,
                  callback: (value: "confirm" | "alert") => (config.type = value),
                }}
              >
                <Select.Option value="confirm">confirm</Select.Option>
                <Select.Option value="alert">alert</Select.Option>
              </Select>
            </FormLayout.Item>
            <FormLayout.Item label="dangerous">
              <Checkbox
                vModel={{
                  value: config.dangerous,
                  callback: (e) => (config.dangerous = e),
                }}
              />
            </FormLayout.Item>
            <FormLayout.Item label="maskClosable">
              <Checkbox
                vModel={{
                  value: config.maskClosable,
                  callback: (e) => (config.maskClosable = e),
                }}
              />
            </FormLayout.Item>
          </FormLayout>
          <br />
          {["info", "success", "warn", "error", "confirm", <span>自定义</span>, void 0].map(
            (icon) => {
              return (
                <Button
                  onClick={async (e) => {
                    if (config.type === "confirm") {
                      console.log(
                        await manager.confirm({
                          title: "标题",
                          content: "内容",
                          icon,
                          dangerous: config.dangerous,
                          iconType: typeof icon === "string" ? icon : void 0,
                          maskClosable: config.maskClosable,
                        })
                      );
                    } else {
                      console.log(
                        await manager.alert({
                          title: "标题",
                          content: "内容",
                          icon,
                          dangerous: config.dangerous,
                          iconType: typeof icon === "string" ? icon : void 0,
                          maskClosable: config.maskClosable,
                        })
                      );
                    }
                  }}
                >
                  {icon || "默认图标"}
                </Button>
              );
            }
          )}
        </Demo>
      );
    };
  },
});

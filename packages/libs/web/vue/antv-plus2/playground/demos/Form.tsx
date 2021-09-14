import { useBreakpoints } from "@yuyi919/vue-use";
import {
  DatePicker,
  Icon,
  InputNumber,
  Select,
  Input,
  Checkbox,
  TimePicker,
  Calendar,
  TreeSelect,
  Radio,
  Cascader,
  Switch,
} from "ant-design-vue";
import { defineComponent, ref, watch } from "vue-demi2";
import { FormLayout, SmartGrid, GridColumn } from "../../src";
import Demo from "../demo.vue";

const CheckCircleFilled = defineComponent({
  functional: true,
  render(h, { data }) {
    return <Icon type="check-circle" theme="filled" {...data} />;
  },
});
const LoadingOutlined = defineComponent({
  setup() {
    return () => <Icon type="loading" theme="outlined" />;
  },
});
const Components: any = {
  FormItem: FormLayout.Item,
  Select,
  Input,
  "Input.Password": Input.Password,
  Checkbox,
  DatePicker,
  "DatePicker.RangePicker": DatePicker.RangePicker,
  "DatePicker.YearPicker": { mixins: [DatePicker], props: { mode: { default: "year" } } },
  "DatePicker.MonthPicker": DatePicker.MonthPicker,
  TimePicker,
  Calendar,
  Cascader,
  TreeSelect,
  NumberPicker: InputNumber,
  Radio,
  Switch: Switch,
};
const SchemaField = {
  String: defineComponent({
    components: Components,
    props: [
      "xDecorator",
      "xComponent",
      "xComponentProps",
      "xDecoratorProps",
      "description",
      "title",
      "required",
    ],
    setup(props, context) {
      return () => {
        const Tag = Components[props.xDecorator] || props.xDecorator;
        const Comp = Components[props.xComponent] || props.xComponent;
        const content = (
          <Comp mergeJsxProps={[{ props: props.xComponentProps }]}>
            {context.slots.default?.()}
          </Comp>
        );
        if (!Tag) {
          return content;
        }
        return (
          <Tag
            mergeJsxProps={[
              {
                props: { label: props.title, helper: props.description, asterisk: props.required },
              },
              { props: props.xDecoratorProps },
            ]}
          >
            {content}
          </Tag>
        );
      };
    },
  }),
  Void: defineComponent({
    components: {
      FormLayout,
      Title: defineComponent({
        props: ["text"],
        setup(props) {
          return () => <h3>{props.text}</h3>;
        },
      }),
    },
    props: ["xDecorator", "xComponent", "xComponentProps", "xDecoratorProps"],
    setup(props, context) {
      return () => {
        const Tag = props.xDecorator;
        const Comp = props.xComponent;
        const content = (
          <Comp mergeJsxProps={[{ props: props.xComponentProps }]}>
            {context.slots.default?.()}
          </Comp>
        );
        if (!Tag) {
          return content;
        }
        return <Tag mergeJsxProps={[{ props: props.xDecoratorProps }]}>{content}</Tag>;
      };
    },
  }),
};

export const FormDemo = defineComponent({
  setup() {
    const matches = useBreakpoints({
      xs: 480,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
      xxl: 1600,
    }).between("sm", "lg");
    watch(matches, matched => {
      console.log("matched", matched)
    }, { immediate: true });
    const pending = ref(true);
    return () => {
      return (
        <div>
          <Demo title="内嵌组件模式">
            <FormLayout>
              <SchemaField.String
                name="input"
                title="Input"
                x-decorator="FormItem"
                x-component="Input"
                required
                x-decorator-props={{
                  inset: true,
                }}
              />
              <SchemaField.String
                name="Select"
                title="Select"
                x-decorator="FormItem"
                x-component="Select"
                required
                x-decorator-props={{
                  inset: true,
                }}
              />
              <SchemaField.String
                name="Select"
                title="Select"
                x-decorator="FormItem"
                x-component="Select"
                required
                x-decorator-props={{
                  inset: true,
                  feedbackStatus: "warning",
                  feedbackText: "warning text"
                }}
              />
              <SchemaField.String
                name="Cascader"
                title="Cascader"
                x-decorator="FormItem"
                x-component="Cascader"
                required
                x-decorator-props={{
                  inset: true,
                }}
              />
              <SchemaField.String
                name="DatePicker"
                title="DatePicker"
                x-decorator="FormItem"
                x-component="DatePicker"
                required
                x-decorator-props={{
                  inset: true,
                }}
              />
              <SchemaField.String
                name="NumberPicker"
                title="NumberPicker"
                x-decorator="FormItem"
                x-component="NumberPicker"
                required
                x-decorator-props={{
                  inset: true,
                }}
              />
              <SchemaField.String
                name="TreeSelect"
                title="TreeSelect"
                x-decorator="FormItem"
                x-component="TreeSelect"
                required
                x-decorator-props={{
                  inset: true,
                }}
              />
              <SchemaField.String
                name="Switch"
                title="Switch"
                x-decorator="FormItem"
                x-component="Switch"
                required
                x-decorator-props={{
                  inset: false,
                }}
              />
            </FormLayout>
          </Demo>
          <Demo title="常用属性案例" desc="可通过feedbackIcon传入指定反馈的按钮">
            <FormLayout>
              <SchemaField.Void
                x-component="Title"
                x-component-props={{ text: "label为空时的展示" }}
              />
              <SchemaField.String
                x-decorator="FormItem"
                x-component="Input"
                x-decorator-props={{
                  labelWidth: 300,
                }}
              />
              <SchemaField.String
                title=""
                x-decorator="FormItem"
                x-component="Input"
                x-decorator-props={{
                  labelWidth: 300,
                }}
              />
              <SchemaField.Void x-component="Title" x-component-props={{ text: "冒号" }} />
              <SchemaField.String title="默认" x-decorator="FormItem" x-component="Input" />
              <SchemaField.String
                title="无冒号(colon=false)"
                x-decorator="FormItem"
                x-component="Input"
                x-decorator-props={{
                  colon: false,
                }}
              />

              <SchemaField.Void x-component="Title" x-component-props={{ text: "固定宽度设置" }} />
              <SchemaField.String
                title="固定label宽度(labelWidth)"
                x-decorator="FormItem"
                x-component="Input"
                x-decorator-props={{
                  labelWidth: 300,
                }}
              />

              <SchemaField.String
                title="tooltip"
                x-decorator="FormItem"
                x-component="Input"
                x-decorator-props={{
                  tooltip: "tooltip",
                }}
              />
              <SchemaField.String
                title="tooltip"
                x-decorator="FormItem"
                x-component="Input"
                x-decorator-props={{
                  tooltip: "tooltip",
                  tooltipLayout: "text",
                }}
              />

              <SchemaField.String
                title="固定label宽度(labelWidth)"
                description="描述描述"
                x-decorator="FormItem"
                x-component="Input"
                x-decorator-props={{
                  labelWidth: 300,
                  tooltip: "提示提示",
                }}
              />
              <SchemaField.String
                title="固定label宽度(labelWidth)溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出"
                description="描述描述"
                x-decorator="FormItem"
                x-component="Input"
                x-decorator-props={{
                  labelWidth: 300,
                  tooltip: "提示提示",
                  tooltipLayout: "text",
                }}
              />
              <SchemaField.String
                title="固定label宽度(labelWidth)溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出溢出"
                description="描述描述"
                x-decorator="FormItem"
                x-component="Input"
                x-decorator-props={{
                  labelWidth: 300,
                  tooltip: "提示提示",
                }}
              />
              <SchemaField.String
                title="固定label宽度(labelWidth)换行换行换行换行换行换行换行换行换行换行换行换行换行换行换行换行换行换行换行换行换行换行换行换行换行换行"
                description="描述描述"
                x-decorator="FormItem"
                x-component="Input"
                x-decorator-props={{
                  labelWidth: 300,
                  labelWrap: true,
                  tooltip: "提示提示",
                }}
              />
              <SchemaField.String
                title="固定内容宽度(wraperWidth)"
                x-decorator="FormItem"
                x-component="Input"
                x-decorator-props={{
                  labelWidth: 300,
                  wrapperWidth: 300,
                }}
              />

              <SchemaField.Void x-component="Title" x-component-props={{ text: "对齐方式设置" }} />
              <SchemaField.String
                title="label左对齐(labelAlign=left)"
                x-decorator="FormItem"
                x-component="Input"
                x-decorator-props={{
                  labelCol: 12,
                  labelAlign: "left",
                }}
              />
              <SchemaField.String
                title="label右对齐(labelAlign=right默认)"
                x-decorator="FormItem"
                x-component="Input"
                x-decorator-props={{
                  labelCol: 12,
                  labelAlign: "right",
                }}
              />

              <SchemaField.String
                title="内容左对齐(wrapperAlign=left默认)"
                x-decorator="FormItem"
                x-component="Input"
                x-decorator-props={{
                  labelCol: 12,
                  wrapperWidth: 240,
                  wrapperAlign: "left",
                }}
              />
              <SchemaField.String
                title="内容右对齐(wrapperAlign=right)"
                x-decorator="FormItem"
                x-component="Input"
                x-decorator-props={{
                  labelCol: 12,
                  wrapperWidth: 240,
                  wrapperAlign: "right",
                }}
              />

              <SchemaField.Void x-component="Title" x-component-props={{ text: "是否撑满" }} />

              <SchemaField.String
                title="默认不撑满(fullness=false)"
                x-decorator="FormItem"
                x-component="Select"
              />
              <SchemaField.String
                title="撑满(fullness=true)"
                x-decorator="FormItem"
                x-component="Select"
                x-decorator-props={{
                  fullness: true,
                }}
              />

              <SchemaField.Void x-component="Title" x-component-props={{ text: "辅助信息" }} />

              <SchemaField.String
                title="必填星号"
                x-decorator="FormItem"
                x-component="Input"
                x-decorator-props={{
                  asterisk: true,
                  labelCol: 6,
                  wrapperCol: 10,
                }}
              />

              <SchemaField.String
                title="前缀"
                x-decorator="FormItem"
                x-component="Input"
                x-decorator-props={{
                  addonBefore: "addonBefore",
                  labelCol: 6,
                  wrapperCol: 10,
                }}
              />
              <SchemaField.String
                title="后缀"
                x-decorator="FormItem"
                x-component="Input"
                x-decorator-props={{
                  addonAfter: "addonAfter",
                  labelCol: 6,
                  wrapperCol: 10,
                }}
              />
              <SchemaField.String
                title="前后缀"
                x-decorator="FormItem"
                x-component="Select"
                x-decorator-props={{
                  addonBefore: "addonBefore",
                  addonAfter: "addonAfter",
                  labelCol: 6,
                  wrapperCol: 10,
                }}
              />

              <SchemaField.String
                title="帮助信息feedbackText"
                x-decorator="FormItem"
                x-component="Input"
                x-decorator-props={{
                  feedbackText: "feedbackText",
                  labelCol: 6,
                  wrapperCol: 10,
                }}
              />

              <SchemaField.String
                title="额外信息extra"
                x-decorator="FormItem"
                x-component="Input"
                x-decorator-props={{
                  feedbackText: "feedbackText",
                  extra: "extra",
                  labelCol: 6,
                  wrapperCol: 10,
                }}
              />
            </FormLayout>
          </Demo>
          <Demo title="切换pending状态" desc="可通过feedbackIcon传入指定反馈的按钮">
            <Checkbox vModel={{ value: pending.value, callback: (e) => (pending.value = e) }}>
              切换pending状态
            </Checkbox>
            <FormLayout layout="horizontal" labelAlign="right" feedbackLayout="loose">
              <SchemaField.String
                title="加载状态(feedbackStatus=pending)"
                x-decorator="FormItem"
                x-component="Select"
                description="description"
                x-decorator-props={{
                  feedbackStatus: pending.value ? "pending" : void 0,
                  feedbackIcon: pending.value ? (
                    <LoadingOutlined style={{ color: "#1890ff" }} />
                  ) : (
                    void 0
                  ),
                }}
              />
            </FormLayout>
          </Demo>
          <Demo title="组件适配情况" desc="可通过feedbackIcon传入指定反馈的按钮">
            <FormLayout layout="horizontal" labelAlign="right" feedbackLayout="loose">
              <SmartGrid maxColumns={1}>
                <SchemaField.String
                  title="错误状态(feedbackStatus=error)"
                  x-decorator="FormItem"
                  x-component="Input"
                  description="description"
                  x-decorator-props={{
                    feedbackStatus: "error",
                  }}
                />

                <SchemaField.String
                  title="警告状态(feedbackStatus=warning)"
                  x-decorator="FormItem"
                  x-component="Input"
                  description="description"
                  x-decorator-props={{
                    feedbackText: "warning message",
                    feedbackStatus: "warning",
                  }}
                />

                <SchemaField.String
                  title="成功状态(feedbackStatus=success)"
                  x-decorator="FormItem"
                  x-component="Input"
                  description="description"
                  x-decorator-props={{
                    feedbackStatus: "success",
                    feedbackIcon: <CheckCircleFilled />,
                  }}
                />

                <SchemaField.String
                  title="加载状态(feedbackStatus=pending)"
                  x-decorator="FormItem"
                  x-component="Input"
                  description="description"
                  x-decorator-props={{
                    feedbackStatus: "pending",
                    feedbackIcon: <LoadingOutlined style={{ color: "#1890ff" }} />,
                  }}
                />

                <SchemaField.Void
                  x-component="Title"
                  x-component-props={{ text: "反馈信息的布局" }}
                />

                <SchemaField.String
                  title="紧凑模式required"
                  x-decorator="FormItem"
                  x-component="Input"
                  required
                  x-decorator-props={{
                    feedbackLayout: "terse",
                  }}
                />

                <SchemaField.String
                  title="紧凑模式有feedback(feedbackLayout=terse)"
                  x-decorator="FormItem"
                  x-component="Input"
                  x-decorator-props={{
                    feedbackStatus: "error",
                    feedbackText: "error message",
                    feedbackLayout: "terse",
                  }}
                />

                <SchemaField.String
                  title="紧凑模式无feedback(feedbackLayout=terse)"
                  x-decorator="FormItem"
                  x-component="Input"
                  x-decorator-props={{
                    feedbackLayout: "terse",
                  }}
                />

                <SchemaField.String
                  title="松散模式(feedbackLayout=loose)"
                  x-decorator="FormItem"
                  x-component="Input"
                  x-decorator-props={{
                    feedbackStatus: "error",
                    feedbackText: "error message",
                    feedbackLayout: "loose",
                  }}
                />

                <SchemaField.String
                  title="弹出模式(feedbackLayout=popover)"
                  x-decorator="FormItem"
                  x-component="Input"
                  x-decorator-props={{
                    feedbackStatus: "warning",
                    feedbackText: "warning message",
                    feedbackLayout: "popover",
                  }}
                />

                <SchemaField.String
                  title="弹出模式(feedbackLayout=popover)"
                  x-decorator="FormItem"
                  x-component="Input"
                  x-decorator-props={{
                    feedbackStatus: "error",
                    feedbackText: "error message",
                    feedbackLayout: "popover",
                  }}
                />
                <SchemaField.String
                  title="弹出模式(feedbackLayout=popover)"
                  x-decorator="FormItem"
                  x-component="Input"
                  x-decorator-props={{
                    feedbackStatus: "success",
                    feedbackText: "success message",
                    feedbackLayout: "popover",
                  }}
                />

                <SchemaField.Void
                  x-component="Title"
                  x-component-props={{ text: "组件的适配情况" }}
                />
                <SchemaField.Void
                  x-component="FormLayout"
                  x-component-props={{ layout: "horizontal" }}
                >
                  <SchemaField.String
                    title="Select"
                    x-decorator="FormItem"
                    x-component="Select"
                    x-decorator-props={{
                      feedbackStatus: "success",
                      feedbackLayout: "popover",
                      feedbackText: "popover",
                      feedbackIcon: <CheckCircleFilled />,
                    }}
                  />

                  <SchemaField.String
                    title="DatePicker"
                    x-decorator="FormItem"
                    x-component="DatePicker"
                    x-decorator-props={{
                      feedbackStatus: "success",
                      feedbackIcon: <CheckCircleFilled />,
                    }}
                  />
                  <SchemaField.String
                    title="DatePicker.RangePicker"
                    x-decorator="FormItem"
                    x-component="DatePicker.RangePicker"
                    x-decorator-props={{
                      feedbackStatus: "success",
                      feedbackIcon: <CheckCircleFilled />,
                    }}
                  />
                  <SchemaField.String
                    title="DatePicker.YearPicker"
                    x-decorator="FormItem"
                    x-component="DatePicker.YearPicker"
                    x-decorator-props={{
                      feedbackStatus: "success",
                      feedbackIcon: <CheckCircleFilled />,
                    }}
                  />
                  <SchemaField.String
                    title="DatePicker.MonthPicker"
                    x-decorator="FormItem"
                    x-component="DatePicker.MonthPicker"
                    x-decorator-props={{
                      feedbackStatus: "success",
                      feedbackIcon: <CheckCircleFilled />,
                    }}
                  />
                  <SchemaField.String
                    title="DatePicker.TimePicker"
                    x-decorator="FormItem"
                    x-component="TimePicker"
                    x-decorator-props={{
                      feedbackStatus: "success",
                      feedbackIcon: <CheckCircleFilled />,
                    }}
                  />
                  <SchemaField.String
                    title="NumberPicker"
                    x-decorator="FormItem"
                    x-component="NumberPicker"
                    x-decorator-props={{
                      feedbackStatus: "success",
                      feedbackIcon: <CheckCircleFilled />,
                    }}
                  />

                  <SchemaField.String
                    title="TreeSelect"
                    x-decorator="FormItem"
                    x-component="TreeSelect"
                    x-decorator-props={{
                      feedbackStatus: "success",
                      feedbackIcon: <CheckCircleFilled />,
                    }}
                  />

                  <SchemaField.String
                    title="Cascader"
                    x-decorator="FormItem"
                    x-component="Cascader"
                    x-decorator-props={{
                      feedbackStatus: "success",
                      feedbackIcon: <CheckCircleFilled />,
                    }}
                  />
                </SchemaField.Void>
              </SmartGrid>
            </FormLayout>
          </Demo>
        </div>
      );
    };
  },
});

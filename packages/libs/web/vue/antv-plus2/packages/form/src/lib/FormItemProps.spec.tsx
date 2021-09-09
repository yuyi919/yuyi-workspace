import { FormItemProps, useFormLayoutItemProps } from "./FormItemProps";
import { FormLayoutProps } from "./FormLayoutProps";
describe("FormItemProps", () => {
  it("收集混合Props", () => {
    const props: FormItemProps = { feedbackStatus: "pending" },
      layoutProps: FormLayoutProps = { layout: "horizontal" };
    const usedProps = useFormLayoutItemProps(props, (key, value, option) => {
      return key in layoutProps ? value ?? layoutProps[key as keyof typeof layoutProps] : value;
    });
    expect(usedProps).toMatchSnapshot();
  });
});

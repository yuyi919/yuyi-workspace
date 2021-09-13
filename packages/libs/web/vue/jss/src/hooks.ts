import { BaseCreateStyle, theme, ITheme } from "./Factory";

export declare class StylesApi<Role, P = any> {
  role: Role;
  append<Props extends P>(style: BaseCreateStyle<Props>): StylesApi<Role, Props>;
  defaults<Props extends P>(style: BaseCreateStyle<Props>): StylesApi<Role, Props>;
}
declare class IBlock<P = any> extends StylesApi<"block", P> { }
declare class IElement<P = any> extends StylesApi<"element", P> { }
declare class IModifier<P = any> extends StylesApi<"IModifier", P> { }
declare function createStyles<ITheme>(hooks: (theme: ITheme) => any): any;
declare function useBlock(name: string): IBlock;
declare function useElement(block: IBlock, name: string): IElement;
declare function useTheme(): IElement;
function useButton() {
  const button = useBlock("button")
    .append<{ size: number; }>({
      color: theme.color,
      fontSize: (props) => props.size,
    })
    .defaults({
      color: "red",
      background: [["url(image1.png)", "url(image2.png)"], "!important"],
    });
  const buttonText = useElement(button, "text");
  return {
    button,
    buttonText,
  };
}
createStyles<ITheme>((theme) => {
  return {
    ...useButton()
  };
});

import { IButtonProps } from "./ButtonProps";

const Classes: {
  root: string;
} & {
  [K in IButtonProps["type"]]?: string;
};
export default Classes;

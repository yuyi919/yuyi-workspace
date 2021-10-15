import * as path from "path";
import { fileToBase64 } from "../utils";

export const courierprimeB64Path = path.join(__dirname, "courier-prime.ttf");
export const courierprimeB64_boldPath = path.join(__dirname, "courier-prime-bold.ttf");
export const courierprimeB64_italicPath = path.join(__dirname, "courier-prime-italic.ttf");
export const courierprimeB64_bolditalicPath = path.join(__dirname, "courier-prime-bold-italic.ttf");

export const courierprimeB64 = fileToBase64(path.join(__dirname, "courier-prime.ttf"));
export const courierprimeB64_bold = fileToBase64(path.join(__dirname, "courier-prime-bold.ttf"));
export const courierprimeB64_italic = fileToBase64(
  path.join(__dirname, "courier-prime-italic.ttf")
);
export const courierprimeB64_bolditalic = fileToBase64(
  path.join(__dirname, "courier-prime-bold-italic.ttf")
);

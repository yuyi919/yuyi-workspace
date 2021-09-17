import { render, createComponent } from "solid-js/web";

import "./index.css";
import App from "./App";


render(() => createComponent(App, { children: 1 }), document.querySelector("#root")!);
@C
class A {}
console.log(A)

function C(target: any) {
  target.ccc = "a"
}

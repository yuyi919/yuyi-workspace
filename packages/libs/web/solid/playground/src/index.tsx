import { hydrate, createComponent } from "solid-js/web";

import App from "./App";

hydrate(() => createComponent(App, { children: 1 }), document.querySelector("#root")!);
// @C
// class A {}
// console.log(A)

// function C(target: any) {
//   target.ccc = "a"
// }

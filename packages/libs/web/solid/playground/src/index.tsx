import { render, hydrate as hydrate, createComponent } from "solid-js/web";
import App from "./App";

// @ts-ignore
(typeof _$HYDRATION !== "undefined" ? hydrate : render)(
  () => createComponent(App, { children: 1 }),
  document.querySelector("#root")!
);

// @C
// class A {}
// console.log(A);

// function C(target: any) {
//   target.ccc = "a";
// }

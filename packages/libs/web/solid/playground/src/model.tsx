import { createRenderEffect } from "solid-js";

export function model(el: any, value: any) {
  console.log(el)
  const [field, setField] = value();
  createRenderEffect(() => (el.value = field()));
  el.addEventListener("input", (e: any) => setField(e.target.value));
}

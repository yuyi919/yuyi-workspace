import "./exports";
import "./mock";
import "./preset";
// import { start } from "./preset";
// start();

window.onload = async function () {
  await import("./lib/start");
  window.focus();
};

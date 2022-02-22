import "./preset";
import "./mock";
// const main = new globalThis.Main();
// main.run();
import "./sound";
import { load } from "./Dialog";

load().then(() => import("./dev"));

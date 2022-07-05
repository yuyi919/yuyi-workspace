export * as Trie from "./trie";
export * as TinyTrie from "./tiny-trie";
export * from "./hexUtil";
import { generateNode } from "../cli/generateNode";
import { processGeneratorNode } from "langium";
// console.log(
//   processGeneratorNode(
//     generateNode(
//       `
// machine_name: "Traffic light";

// Closed 'On' => Red;
// Red 'Next' => Green 'Next' => Yellow 'Next' => Red;

// [Red Yellow Green] 'Off' ~> Closed;
// `,
//       "app.ts",
//       {}
//     ).fileNode,
//     2
//   )
// );
// export enum LightState {
//   Off,
//   Red,
//   Green,
//   Yellow,
// }
// export enum Action {
//   Off,
//   Enable,
//   Next,
// }
// export const Light = sm<1>`
//   machine_name: "Traffic light";

//   ${LightState.Off} '${Action.Enable}' => ${LightState.Red};
//   ${LightState.Red} '${Action.Next}' => ${LightState.Green} '${Action.Next}' => ${LightState.Yellow} '${Action.Next}' => ${LightState.Red};

//   [${LightState.Red} ${LightState.Yellow} ${LightState.Green}] '${Action.Off}' ~> ${LightState.Off};
// `;
export * from "./fsm";

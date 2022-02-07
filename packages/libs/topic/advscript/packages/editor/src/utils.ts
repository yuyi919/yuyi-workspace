import { COMMAND_ID } from "@yuyi919/advscript-language-services";
export function triggerCommand(
  id: typeof COMMAND_ID[keyof typeof COMMAND_ID] | (string & {}),
  payload: any
) {
  globalThis.app._triggerCommand(id, payload);
}
export { COMMAND_ID };

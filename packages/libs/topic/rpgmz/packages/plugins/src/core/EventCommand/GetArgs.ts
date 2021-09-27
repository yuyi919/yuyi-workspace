import { TCommandEvent, TEventType } from "./EventCallerMap";

export type GetArgs<T> = T extends (...args: infer Args) => any ? Args : [];

export function createEvent(type: TEventType, ...parameters: any[]): TCommandEvent {
  return { code: type, indent: 0, parameters: parameters };
}

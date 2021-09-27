/* eslint-disable prefer-spread */
import {
  EventCallerMap,
  EventCallerNameMap,
  TCreateEventArgsMap,
  TEventActionMap,
  TEventType,
} from "./EventCallerMap";
import Core from "@yuyi919/rpgmz-core";
import { createEvent } from "./GetArgs";

export type EventCaller = {
  call(): boolean;
  add<Type extends TEventType>(type: Type, ...parameters: TCreateEventArgsMap[Type]): EventCaller;
} & {
  [K in keyof TEventActionMap]: {
    (...args: TCreateEventArgsMap[TEventActionMap[K]]): EventCaller;
  };
};

export function generateEvent(eventList: any[] = []): EventCaller {
  const hacker = Core.$gameMap._interpreter;
  function commandCaller<Type extends TEventType>(type: Type) {
    return function (...parameters: TCreateEventArgsMap[Type]) {
      const event = (EventCallerMap[type] as typeof EventCallerMap[TEventType]).apply(
        null,
        parameters as any
      );
      eventList.push(event);
      return caller;
    };
  }
  const caller: EventCaller = {
    call() {
      eventList.push(createEvent(TEventType.结束事件));
      hacker.setupChild(eventList, 0);
      return hacker.updateChild();
    },
    add<Type extends TEventType>(type: Type, ...parameters: TCreateEventArgsMap[Type]) {
      return commandCaller(type).apply(null, parameters);
    },
    ...Object.entries(EventCallerNameMap).reduce((r, [key, type]) => {
      return {
        ...r,
        [key]: commandCaller(type),
      };
    }, {} as Omit<EventCaller, "call" | "add">),
  };
  return caller;
}

export function generateBattleEvent(eventList: any[] = []): EventCaller {
  const hacker = Core.$gameTroop._interpreter;
  function commandCaller<Type extends TEventType>(type: Type) {
    return function (...parameters: TCreateEventArgsMap[Type]) {
      const event = (EventCallerMap[type] as typeof EventCallerMap[TEventType]).apply(
        null,
        parameters as any
      );
      eventList.push(event);
      return caller;
    };
  }
  const caller: EventCaller = {
    call() {
      eventList.push(createEvent(TEventType.结束事件));
      hacker.setupChild(eventList, 0);
      return hacker.updateChild();
    },
    add<Type extends TEventType>(type: Type, ...parameters: TCreateEventArgsMap[Type]) {
      return commandCaller(type).apply(null, parameters);
    },
    ...Object.entries(EventCallerNameMap).reduce((r, [key, type]) => {
      return {
        ...r,
        [key]: commandCaller(type),
      };
    }, {} as Omit<EventCaller, "call" | "add">),
  };
  return caller;
}
export * from "./CallScriptCommand";

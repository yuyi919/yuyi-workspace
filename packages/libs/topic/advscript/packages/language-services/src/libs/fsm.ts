import type { JssmGenericConfig } from "jssm/jssm_types";
import { Machine } from "jssm";

export const enum TrafficLightState {
  Closed,
  Red,
  Green,
  Yellow,
}

export const enum TrafficLightAction {
  On = 1,
  Next,
  Off,
}

export class TrafficLight<T> {
  static create<T>() {
    return new TrafficLight<T>({
      start_states: [0],
      transitions: [
        { from: 0, to: 1, kind: "main", forced_only: false, main_path: true, action: 1 },
        { from: 1, to: 2, kind: "main", forced_only: false, main_path: true, action: 2 },
        { from: 2, to: 3, kind: "main", forced_only: false, main_path: true, action: 2 },
        { from: 3, to: 1, kind: "main", forced_only: false, main_path: true, action: 2 },
        { from: 1, to: 0, kind: "forced", forced_only: true, main_path: false, action: 3 },
        { from: 3, to: 0, kind: "forced", forced_only: true, main_path: false, action: 3 },
        { from: 2, to: 0, kind: "forced", forced_only: true, main_path: false, action: 3 },
      ],
      machine_name: "Traffic light",
    } as any);
  }

  fsm!: Machine<T>;

  constructor(config: JssmGenericConfig<T>) {
    this.fsm = new Machine<T>(config);
  }

  checkState() {
    const state = this.fsm.state() as unknown as TrafficLightState;
    switch (state) {
      case 0:
        return "Closed"; // 0 = TrafficLightState.Closed
      case 1:
        return "Red"; // 1 = TrafficLightState.Red
      case 2:
        return "Green"; // 2 = TrafficLightState.Green
      case 3:
        return "Yellow"; // 3 = TrafficLightState.Yellow
      default:
        throw Error("未知状态！");
    }
  }

  static checkAction(action: TrafficLightAction) {
    switch (action) {
      case 1:
        return "On"; // 1 = TrafficLightAction.On
      case 2:
        return "Next"; // 2 = TrafficLightAction.Next
      case 3:
        return "Off"; // 3 = TrafficLightAction.Off
      default:
        throw Error("未设定的动作！");
    }
  }

  on() {
    return this.fsm.action(1 as unknown as string); // TrafficLightAction.On
  }

  next() {
    return this.fsm.action(2 as unknown as string); // TrafficLightAction.Next
  }

  off() {
    return this.fsm.action(3 as unknown as string); // TrafficLightAction.Off
  }

  state: Machine<T>["state"] = (...args) => this.fsm.state(...args);

  states: Machine<T>["states"] = (...args) => this.fsm.states(...args);

  theme: Machine<T>["theme"] = (...args) => this.fsm.theme(...args);

  flow: Machine<T>["flow"] = (...args) => this.fsm.flow(...args);

  actions: Machine<T>["actions"] = (...args) => this.fsm.actions(...args);

  action: Machine<T>["action"] = (...args) => this.fsm.action(...args);

  transition: Machine<T>["transition"] = (...args) => this.fsm.transition(...args);

  sm: Machine<T>["sm"] = (...args) => this.fsm.sm(...args);
}

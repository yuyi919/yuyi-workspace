import { reverseKV, TReverseKV } from "../reverseKeyAndValue";
import { createEvent, GetArgs } from "./GetArgs";

export enum TEventType {
  结束事件,
  配置对话框 = 101,
  发送对话 = 401,
  播放se = 250,
  停止se = 251,
}
export type TCommandEvent = {
  code: TEventType;
  indent: number;
  parameters: any[];
};
export const EventCallerMap = {
  [TEventType.配置对话框](
    speakerName?: string | null,
    config: {
      faceName?: string | null;
      faceIndex?: number | null;
      background?: number | null;
      positionType?: number | null;
    } = {}
  ) {
    const { faceName = "", faceIndex = 0, background = 0, positionType = 2 } = config;
    // 注意createEvent的参数顺序是固定的
    return createEvent(
      TEventType.配置对话框,
      faceName,
      faceIndex,
      background,
      positionType,
      speakerName
    );
  },
  [TEventType.发送对话](sendMessage: string) {
    return createEvent(TEventType.发送对话, sendMessage);
  },
  /**
   *
   * @param sePath 相对se目录的路径
   * @param volume 音量
   */
  [TEventType.播放se](sePath: string, volume = 90, pitch = 100, pan = 0) {
    return createEvent(TEventType.播放se, { name: sePath, volume, pitch, pan });
  },
  [TEventType.停止se]() {
    return createEvent(TEventType.停止se);
  },
  [TEventType.结束事件]() {
    return createEvent(TEventType.结束事件);
  },
};

const EventCallerName = {
  [TEventType.结束事件]: "fin",
  [TEventType.配置对话框]: "configureMessage",
  [TEventType.发送对话]: "sendMessage",
  [TEventType.播放se]: "playSe",
  [TEventType.停止se]: "stopSe",
} as const;
export const EventCallerNameMap = reverseKV(EventCallerName);
export type TEventActionMap = TReverseKV<typeof EventCallerName>;

export type TEventCallerMap = typeof EventCallerMap;
export type TCreateEventArgsMap = {
  [K in keyof TEventCallerMap]: GetArgs<TEventCallerMap[K]>;
};

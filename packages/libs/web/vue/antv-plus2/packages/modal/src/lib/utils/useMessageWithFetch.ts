/* eslint-disable no-async-promise-executor */
/* eslint-disable no-sparse-arrays */
import { castArray } from "lodash";
import { Modal, Message, ModalConfirm } from "./core";

export type MessageType = "info" | "success" | "error" | "loading";
export type FullReq = [string, number?, MessageType?, boolean?];
export type Req = string | (FullReq | string)[];

/**
 * 生成连续的请求过程提示信息
 * @param fetch
 * @param onFetchStart
 * @param onSuccess
 * @param onFailed
 * @param enforce 错误信息使用确认弹框
 * @remarks
 * @example
 *  await useMessageWithFetch(
 *     async () => {
 *        console.error('123456')
 *     },
 *     '表单数据加载中...',
 *     '数据载入成功',
 *     [['数据载入失败', 150, 'info']]
 *   )
 */
export function useMessageWithFetch<T = any>(
  fetch: () => Promise<T>,
  onFetchStart: Req,
  onSuccess: Req = [],
  onFailed: Req = [["数据载入失败", 150, "info"]],
  enforce = false
): Promise<T> & { cancel(): void } {
  let hidden: (() => void) | undefined;
  function cancel() {
    // eslint-disable-next-line no-unused-expressions
    hidden?.();
  }
  return Object.assign(
    new Promise<T>(async (resolve, reject) => {
      hidden = (onFetchStart &&
        (await messageArray("loading", castArray(onFetchStart) as Req[]))) as () => void;
      try {
        const r = await fetch();
        onSuccess && messageArray("success", castArray(onSuccess) as Req[]);
        resolve(r);
      } catch (e: any) {
        const msg: string = (e as Error)?.message || (e as string);
        messageArray(
          "error",
          (castArray(onFailed) as Req[]).concat([enforce ? [msg, 150, "error", true] : msg])
        );
        reject(e);
      } finally {
        cancel();
      }
    }),
    {
      cancel,
    }
  );
}

const titleMap: Partial<Record<MessageType, any>> = {
  error: "错误",
};

function getMessage(
  msg: Req,
  defaultType: MessageType
): [undefined | false | ModalConfirm, number] {
  const [content, timeout = 100, innerType = defaultType, isKeyMessage] = castArray(msg) as [
    string,
    number?,
    MessageType?,
    boolean?
  ];
  if (content) {
    if (isKeyMessage && innerType !== "loading") {
      const r =
        Modal[innerType] &&
        Modal[innerType]!({
          title: titleMap[innerType] || "提示",
          content,
        });
      return [, timeout];
    } else {
      return [Message[innerType](content, innerType === "loading" ? 0 : undefined) as any, timeout];
    }
  }
  return [false, timeout];
}
/**
 *
 * @param type
 * @param message
 */
async function messageArray(type: MessageType = "info", message: Req[]) {
  const list = castArray(message);
  const close: any[] = [];
  for (const msg of list) {
    const r = getMessage(msg, type);
    if (r[0]) close.push(r[0]);
    if (list.length > 1) await new Promise((resolve) => setTimeout(resolve, r[1]));
  }
  return function () {
    close.forEach((h) => h && h());
  };
}

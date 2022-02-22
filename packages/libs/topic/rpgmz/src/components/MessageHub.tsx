import { Valid } from "@react-spring/core/dist/declarations/src/types/common";
import { OneOrMore } from "@react-spring/types";
import { animated, useTransition, UseTransitionProps } from "@react-spring/web";
import { debounce } from "lodash";
import React, { MouseEvent, useEffect, useMemo, useState } from "react";
import { X } from "react-feather";
// import { Container, Message, Button, Content, Life } from "./styles";
import modules from "./MessageHub.module.css";

let id = 0;
export function useTransitionPropsDef<Item, Props extends object>(
  data: OneOrMore<Item>,
  props: UseTransitionProps<Item> | (Props & Valid<Props, UseTransitionProps<Item>>)
): UseTransitionProps<Item> | (Props & Valid<Props, UseTransitionProps<Item>>) {
  return props;
}
export interface MessageHubProps<T> {
  config?: {
    tension: number;
    friction: number;
    precision: number;
  };
  timeout?: number;
  children: (add: AddFunction) => void;
  getWidth?: (item: T) => number;
  getHeight?: (item: T) => number;
}

export type AddFunction = (msg: string) => void;

interface MessageItem {
  key: number;
  /**
   * 消息
   */
  msg: string;
  /**
   * 是否正在暂停动画
   */
  pause?: boolean;
  /**
   * 是否已取消动画
   */
  canceled?: boolean;
}

export function useMessageHub<T>({
  config = { tension: 125, friction: 20, precision: 0.1 },
  timeout = 3000,
  children,
  getWidth,
  getHeight
}: MessageHubProps<T>) {
  const refMap = useMemo(() => new WeakMap<MessageItem, T>(), []);
  const cancelMap = useMemo(
    () =>
      new WeakMap<
        MessageItem,
        {
          cancel: any;
          pause: any;
          resume: any;
        }
      >(),
    []
  );
  const [items, setItems] = useState<MessageItem[]>([]);
  const useTransitionProps = useMemo(
    () =>
      useTransitionPropsDef(items, {
        from: { opacity: 0, height: 0, left: -300, life: "100%" },
        keys: (item) => item.key,
        enter: (item) => async (next, cancel) => {
          const remuseHandle = debounce(() => {
            !item.canceled && next({ pause: false });
          }, 500);
          cancelMap.set(item, {
            cancel() {
              item.canceled = true;
              return cancel().resume();
            },
            pause() {
              !item.canceled && next({ pause: (item.pause = true) });
              remuseHandle.cancel();
            },
            resume() {
              item.pause = false;
              remuseHandle();
            }
          });
          await next({
            opacity: 1,
            height: getHeight?.(refMap.get(item)) ?? 0,
            left: 0
          });
          await next({ life: "0%" });
        },
        leave: (item) => async (next, cancel) => {
          // console.log(item);
          // await next({
          //   onResume() {
          //     next({ pause: true });
          //   }
          // });
          await next({
            opacity: 0,
            height: 0,
            left: -(getWidth?.(refMap.get(item)) ?? 0)
          });
        },
        onRest: (result, ctrl, item) => {
          setItems((state) =>
            state.filter((i) => {
              return i.key !== item.key;
            })
          );
        },
        config: (item, index, phase) => (key) =>
          phase === "enter" && key === "life" ? { duration: timeout } : config
      }),
    [cancelMap, refMap, timeout]
  );
  const transitions = useTransition(items, useTransitionProps);

  useEffect(() => {
    children((msg: string) => {
      setItems((state) => [...state, { key: id++, msg }]);
    });
  }, []);
  return [
    transitions,
    {
      refMap,
      cancel(item: MessageItem) {
        if (cancelMap.has(item)) cancelMap.get(item).cancel();
      },
      pause(item: MessageItem) {
        if (cancelMap.has(item)) cancelMap.get(item).pause();
      },
      resume(item: MessageItem) {
        if (cancelMap.has(item)) cancelMap.get(item).resume();
      }
    }
  ] as const;
}
export function MessageHub(props: MessageHubProps<any>) {
  const [transitions, action] = useMessageHub<HTMLDivElement>(
    React.useMemo(
      () => ({
        ...props,
        getHeight(div) {
          return div.offsetHeight;
        },
        getWidth(div) {
          return div.offsetWidth;
        }
      }),
      [props]
    )
  );

  return (
    <div className={modules.container}>
      {transitions(({ life, ...style }, item) => (
        <animated.div style={style} className={modules.message}>
          <div
            className={modules.content}
            ref={(ref: HTMLDivElement) => ref && action.refMap.set(item, ref)}
            onMouseOver={() => action.pause(item)}
            onMouseLeave={(e) => {
              action.resume(item);
            }}
          >
            <animated.div style={{ right: life }} className={modules.life} />
            <p>{item.msg}</p>
            <div
              className={modules.button}
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
                if (life.get() !== "0%") action.cancel(item);
              }}
            >
              <X size={18} />
            </div>
          </div>
        </animated.div>
      ))}
    </div>
  );
}

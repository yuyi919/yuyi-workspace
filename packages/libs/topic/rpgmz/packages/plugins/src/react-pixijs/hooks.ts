import React from "react";

const { Graphics, SceneManager, Scene_Title } = globalThis;

export type UpdateHandle = (deltaTime: number) => any;
const updater = new Map<UpdateHandle, any>();
let _active = SceneManager.isGameActive();

// fire tricker
Yuyi919.proxyStaticMethodAfter(SceneManager, "update", (ins, _, deltaTime) => {
  const isActive = SceneManager.isGameActive();
  if (_active !== isActive) {
    _active = isActive;
    if (!isActive) {
      update(deltaTime);
    }
  }
  if (isActive) {
    update(deltaTime);
  }
});
Graphics.setTickHandler(SceneManager.update.bind(SceneManager));
// 在场景terminate时清除所有tricker
Yuyi919.proxyStaticMethodAfter(SceneManager, "onSceneTerminate", () => {
  updater.clear();
  console.debug("onSceneTerminate");
});
Yuyi919.proxyMethodAfter(Scene_Title, "start", () => {
  console.debug("Scene_Title");
});

export function update(deltaTime: number) {
  for (const [handle, context] of updater.entries()) {
    context ? handle.apply(context, [deltaTime]) : handle(deltaTime);
  }
}

export function addUpdater(handle: UpdateHandle, context?: any) {
  updater.set(handle, context);
}
export function removeUpdater(handle: UpdateHandle) {
  updater.delete(handle);
}

export function useUpdater(callback: UpdateHandle, enabled = true) {
  const savedRef = React.useRef(null);

  React.useEffect(() => {
    savedRef.current = callback;
  }, [callback]);

  React.useEffect(() => {
    if (enabled) {
      updater.set(savedRef.current, null);
      return () => {
        if (updater) {
          updater.delete(savedRef.current);
        }
      };
    }
  }, [enabled]);
}

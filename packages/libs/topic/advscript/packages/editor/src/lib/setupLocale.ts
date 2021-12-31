import metadata from "monaco-editor/dev/nls.metadata.json";
// @ts-ignore
import zhCn from "./zh-cn.json";

export function setupLocale() {
  const target = Object.create(null);
  for (const module of metadata.bundles["vs/editor/editor.main"]) {
    const keys = metadata.keys[module];
    const defaultMessages = metadata.messages[module];
    const translations = zhCn[module] || defaultMessages;
    const targetStrings = {};
    if (translations) {
      for (let i = 0; i < keys.length; i++) {
        const elem = keys[i];
        const key = typeof elem === "string" ? elem : elem.key;
        let translatedMessage = translations[i];
        if (translatedMessage === undefined) {
          translatedMessage = defaultMessages[i];
        }
        targetStrings[key] = translatedMessage;
      }
    }
    // Object.assign(target, targetStrings)
    target[module] = targetStrings;
  }
  console.debug("setupLocale");
  return target;
}
window.MonacoEnvironment.locale = setupLocale();

declare global {
  namespace monaco {
    // 追加
    interface Environment {
      locale?: Record<string, Record<string, string>>;
    }
  }
}

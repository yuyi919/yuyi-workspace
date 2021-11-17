let hasGetWorkUrl = false;

const g = window.MonacoEnvironment.getWorkerUrl;
const g2 = window.MonacoEnvironment.getWorker;
// 初始化编辑器
window.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    hasGetWorkUrl = true;
    const url =
      g(moduleId, label) ??
      (typeof setupUrls[label] === "string" ? setupUrls[label] : (setupUrls[label] as Function)());
    console.log("getWorkerUrl", moduleId, label, "=>", url);
    return url;
  },
  getWorker(_, label) {
    const url = window.MonacoEnvironment.getWorkerUrl(_, label)
    if (typeof url === 'string') {
      return g2(_, label)
    }
    return url
  },
};

const setupUrls: Record<string, string | Function> = {};
export function setupWorkerUrl(label: string, url: string | Function) {
  setupUrls[label] = url;
}

export function waitMonaco() {
  return new Promise<void>((r) => {
    const loop = () => {
      if (hasGetWorkUrl) {
        setTimeout(() => {
          r();
        }, 10);
      } else {
        setTimeout(() => {
          loop();
        }, 10);
      }
    };
    loop();
  });
}

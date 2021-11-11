let hasGetWorkUrl = false;

const g = window.MonacoEnvironment.getWorkerUrl;
// 初始化编辑器
window.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    hasGetWorkUrl = true;
    const url = g(moduleId, label) ?? setupUrls[label];
    console.debug("getWorkerUrl", moduleId, label, "=>", url);
    return url;
  },
};

const setupUrls: Record<string, string> = {};
export function setupWorkerUrl(label: string, url: string) {
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

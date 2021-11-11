const loader = import("./avs.worker");
self.onmessage = async function (ev: MessageEvent<any>) {
  await loader;
  self.onmessage(ev);
};

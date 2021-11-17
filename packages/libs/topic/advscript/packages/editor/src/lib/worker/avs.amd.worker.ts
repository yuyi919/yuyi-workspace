const loader = import("./avs.worker");
self.onmessage = async function (ev) {
  await loader;
  self.onmessage(ev);
};

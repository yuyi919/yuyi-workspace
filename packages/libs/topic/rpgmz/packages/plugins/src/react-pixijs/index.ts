// import { proxyStaticMethodAfter } from "../core";
// import wasm from "@lazarv/wasm-yoga";
// import { setYogaProperties } from "./props";

const { Video, Graphics } = globalThis;
Yuyi919.proxyStaticMethodAfter(Video, "_createElement", (target) => {
  target._element.style.display = "none";
});

Yuyi919.proxyStaticMethodAfter(Video, "_updateVisibility", (target, _, visible) => {
  target._element.style.display = visible ? "" : "none";
});
if (Video._element && !Video.isPlaying()) {
  Video._element.style.display = "none";
}

if (Graphics._errorPrinter) {
  Graphics._errorPrinter.style.pointerEvents = "none";
}

Yuyi919.proxyStaticMethodAfter(Graphics, "_createErrorPrinter", (target, _) => {
  target._errorPrinter.style.pointerEvents = "none";
});

export * from "./root";
export * from "./types";

// wasm().then((yoga) => {
//   const Node = yoga.Node;
//   const root = Node.createDefault();
//   setYogaProperties(
//     yoga,
//     root,
//     {
//       flexDirection: "row",
//       alignItems: "space-around",
//       justifyContent: "center",
//     },
//     1
//   );
//   // root.setAlignItems(yoga.YGAlignCenter);
//   const node1 = Node.createDefault();
//   let h = 10;
//   node1.setDirtiedFunc(() => {
//     console.log("node1 size is", 100, h);
//   });
//   node1.setMeasureFunc(() => {
//     return new yoga.Size(100, 100);
//   });
//   node1.markDirty();

//   const node2 = Node.createDefault();
//   setYogaProperties(
//     yoga,
//     node2,
//     {
//       width: 200,
//       height: 50,
//     },
//     1
//   );

//   root.insertChild(node1, 0);
//   root.insertChild(node2, 1);

//   root.calculateLayout(500, 300, yoga.YGDirectionLTR);

//   const rootLayout = root.getComputedLayout();

//   const rootEl = document.createElement("div");
//   const node1El = document.createElement("div");
//   const node2El = document.createElement("div");
//   rootEl.style.backgroundColor = "red";
//   rootEl.style.position = "absolute";
//   rootEl.style.width = `${rootLayout.width}px`;
//   rootEl.style.height = `${rootLayout.height}px`;

//   function update() {
//     const node1Layout = node1.getComputedLayout();
//     const node2Layout = node2.getComputedLayout();
//     node1El.style.backgroundColor = "green";
//     node1El.style.position = "absolute";
//     node1El.style.left = `${node1Layout.left}px`;
//     node1El.style.top = `${node1Layout.top}px`;
//     node1El.style.width = `${node1Layout.width}px`;
//     node1El.style.height = `${node1Layout.height}px`;

//     node2El.style.backgroundColor = "blue";
//     node2El.style.position = "absolute";
//     node2El.style.left = `${node2Layout.left}px`;
//     node2El.style.top = `${node2Layout.top}px`;
//     node2El.style.width = `${node2Layout.width}px`;
//     node2El.style.height = `${node2Layout.height}px`;
//   }

//   rootEl.appendChild(node1El);
//   rootEl.appendChild(node2El);

//   update();
//   document.body.appendChild(rootEl);

//   setInterval(() => {
//     setYogaProperties(
//       yoga,
//       node1,
//       {
//         height: ++h,
//       },
//       1
//     );
//     root.calculateLayout(500, 300, yoga.YGDirectionLTR);
//     update();
//   }, 200);

//   // Node.destroy(node1);
//   // Node.destroy(node2);
//   // Node.destroy(root);
// });

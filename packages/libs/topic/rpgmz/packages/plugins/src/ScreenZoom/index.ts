/**
 * @package
 * 重构了DLC的ScreenZoom，并添加了缓动(easing)选项
 */

// import { ScreenZoomUtils, SetMapScale } from "./ScreenZoomUtils";
import * as ScreenZoomUtils from "./Module";
import { SetMapScale } from "./Module";

export default Yuyi919.createPlugin(({ registerCommand }) => {
  ScreenZoomUtils.setup();

  registerCommand("set", ScreenZoomUtils.setZoom);
  registerCommand("reset", ScreenZoomUtils.resetZoom);
  registerCommand("Zoom200", async (args: SetMapScale) => {
    const args2: SetMapScale = {} as SetMapScale;
    args2.EventId = +args.EventId;
    args2.OffsetX = 0;
    args2.OffsetY = 0;
    args2.scale = 2;
    args2.FramesToZoom = 1;
    ScreenZoomUtils.setZoom(args2);
  });
  registerCommand("Zoom300", (args: SetMapScale) => {
    const args2: SetMapScale = {} as SetMapScale;
    args2.EventId = +args.EventId;
    args2.OffsetX = 0;
    args2.OffsetY = 0;
    args2.scale = 3;
    args2.FramesToZoom = 1;
    ScreenZoomUtils.setZoom(args2);
  });
});

import RMMZ from "@yuyi919/rpgmz-core";

export interface SetMapScale {
  EventId: number;
  OffsetX: number;
  OffsetY: number;
  FramesToZoom: number;
  scale: number;
  isPictureZoom: boolean;
  easing?: Yuyi919.Easing.EasingType;
}

export let currentEventId = 0;
export let _offsetX = 0;
export let _offsetY = 0;
export let _container: any = null;
const thisEventId = () => RMMZ.$gameMap._interpreter.eventId();

const xFromEventId = (eventId: number) => {
  let x;
  if (!eventId) {
    eventId = thisEventId();
  }
  if (eventId === -1) {
    x = RMMZ.$gamePlayer.screenX();
  } else if (eventId > 0) {
    const event = RMMZ.$gameMap.event(eventId);
    if (event) {
      x = event.screenX();
    }
  }
  return x;
};

const yFromEventId = (eventId: number) => {
  let y: number;
  if (!eventId) {
    eventId = thisEventId();
  }
  if (eventId === -1) {
    y = RMMZ.$gamePlayer.screenY();
  } else if (eventId > 0) {
    const event = RMMZ.$gameMap.event(eventId);
    if (event) {
      y = event.screenY();
    }
  }
  return y;
};

// 缓动移动
let easingHelper: Yuyi919.Easing.EasingHelper | null;

/**
 * 开始缩放
 * @param x
 * @param y
 * @param scale
 * @param duration
 * @param easingType
 */
export function startZoom(
  x: number,
  y: number,
  scale: number,
  duration: number,
  easingType: Yuyi919.Easing.EasingType = "quarticInOut"
) {
  const target = RMMZ.$gameScreen;
  target.startZoom(x, y, scale, duration);
  easingHelper = Yuyi919.Easing.createEasingHelper(easingType, target._zoomScale, scale, duration);
}
const currentSpriteset = () => RMMZ.SceneManager._scene._spriteset;
/**
 * pictures are not zoom
 * @param scene
 */
function undertakeSpritePicture(scene: RMMZ.Scene_Base) {
  const spriteset = currentSpriteset();
  // _container = spriteset.removePictureContainer();
  _container = removePictureContainer(spriteset);
  scene.removeChild(scene._windowLayer);
  scene.addChild(_container);
  scene.addChild(scene._windowLayer);
}
function remandSpritePicture(scene: RMMZ.Scene_Base) {
  const spriteset = currentSpriteset();
  scene.removeChild(_container);
  // spriteset.addPictureContainerAgain();
  addPictureContainerAgain(spriteset);
  _container = null;
}
function removePictureContainer(spriteset: RMMZ.Spriteset_Base) {
  spriteset.removeChild(spriteset._pictureContainer);
  return spriteset._pictureContainer;
}
function addPictureContainerAgain(spriteset: RMMZ.Spriteset_Base) {
  spriteset.removeChild(spriteset._timerSprite);
  spriteset.addChild(spriteset._pictureContainer);
  spriteset.addChild(spriteset._timerSprite);
}
/**
 * 设置缩放
 */
export function setZoom(args: SetMapScale) {
  const eventId = +args.EventId;
  currentEventId = eventId ? eventId : thisEventId();
  const offsetX = +args.OffsetX;
  const offsetY = +args.OffsetY;
  const frameToZoom = +args.FramesToZoom;
  let x = xFromEventId(eventId);
  let y = yFromEventId(eventId);
  if (x != null && y != null) {
    x += _offsetX = offsetX;
    y += _offsetY = offsetY;
    startZoom(x, y, +args.scale, frameToZoom, args.easing);
    if (!_container && !args.isPictureZoom) {
      // RMMZ.SceneManager._scene.undertakeSpritePicture();
      undertakeSpritePicture(RMMZ.SceneManager._scene);
    }
  }
}

/**
 * 重置缩放
 */
export function resetZoom({ easing, FramesToZoom }: Pick<SetMapScale, "easing" | "FramesToZoom">) {
  if (currentEventId) {
    const x = xFromEventId(currentEventId);
    const y = yFromEventId(currentEventId);
    startZoom(x, y, 1, FramesToZoom, easing);
    if (_container) {
      // RMMZ.SceneManager._scene.remandSpritePicture();
      remandSpritePicture(RMMZ.SceneManager._scene);
    }
  }
  currentEventId = 0;
}

export function setup() {
  const { Game_Screen, Scene_Map } = RMMZ;

  const _Scene_Map_terminate = Scene_Map.prototype.terminate;
  Scene_Map.prototype.terminate = function () {
    if (_container) {
      this.removeChild(_container);
      _container = null;
    }
    _Scene_Map_terminate.call(this);
  };

  /**
   * 更新缩放（覆盖Game_Screen.updateZoom
   */
  Yuyi919.proxyMethod(Game_Screen, "updateZoom", (_, sourceHandle) => {
    const target = RMMZ.$gameScreen;
    if (easingHelper) {
      if (target._zoomDuration > 0) {
        target._zoomScale = easingHelper.process(easingHelper.duration - target._zoomDuration--);
      } else {
        easingHelper = null;
      }
      return;
    }
    return sourceHandle();
  });
  return true;
}

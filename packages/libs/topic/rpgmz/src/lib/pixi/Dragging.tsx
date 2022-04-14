import React from "react";
import { KeepedContainer } from "./KeepedContainer";


export const Dragging: React.FC<{ enabled?: boolean; }> = ({ children, enabled }) => {
  const ref = React.useRef<PIXI.Container>();
  const core = React.useMemo(() => new DragCore(), []);
  const coreRef = React.useRef<DragCore>();
  React.useEffect(() => {
    coreRef.current = core;
    if (enabled)
      return core.enableDrag(ref.current);
  }, [enabled, core]);
  return (
    <KeepedContainer interactive ref={ref}>
      {children}
    </KeepedContainer>
  );
};
Dragging.defaultProps = {
  enabled: true
};
class DragCore {
  data: PIXI.interaction.InteractionData | null;
  dragStart: boolean = false;
  dragging: boolean = false;
  offsetY: number;
  offsetX: number;

  target: PIXI.Container;
  enableDrag(target: PIXI.Container) {
    this.target = target;
    target
      .on("pointerdown", this.onDragStart)
      .on("pointerup", this.onDragEnd)
      .on("pointerupoutside", this.onDragEnd)
      .on("pointermove", this.onDragMove);
    return () => this.disableDrag(target);
  }
  disableDrag(target: PIXI.Container) {
    this.target = null;
    target
      .off("pointerdown", this.onDragStart)
      .off("pointerup", this.onDragEnd)
      .off("pointerupoutside", this.onDragEnd)
      .off("pointermove", this.onDragMove);
  }

  onDragStart = (event: PIXI.interaction.InteractionEvent) => {
    console.log(event);
    if (event.currentTarget === this.target) {
      // store a reference to the data
      // the reason for this is because of multitouch
      // we want to track the movement of this particular touch
      // if (this.offsetX !== 0) {
      this.data = event.data;
      this.dragStart = true;
      // }
      const bound = this.target.getLocalBounds();
      const newPosition = event.data.getLocalPosition(this.target.parent);
      console.log(this.target, bound, newPosition);
      this.offsetX = newPosition.x - this.target.x; // event.target.pivot.x;
      this.offsetY = newPosition.y - this.target.y; //event.target.pivot.y;

      // this.target.blendMode = PIXI.BLEND_MODES.ADD;
    }
  };
  onDragEnd = (event: PIXI.interaction.InteractionEvent) => {
    if (this.data && event.currentTarget === this.target) {
      this.dragStart = false;
      // set the interaction data to null
      this.data = null;
      if (this.dragging) {
        this.offsetX = 0;
        this.offsetY = 0;
        this.dragging = false;
        event.stopPropagation();
      }
      // this.target.blendMode = PIXI.BLEND_MODES.NONE;
    }
  };
  onDragMove = (event: PIXI.interaction.InteractionEvent) => {
    if (event.currentTarget === this.target && this.dragStart) {
      const newPosition = this.data.getLocalPosition(this.target.parent);
      const nextX = -this.offsetX + newPosition.x,
        nextY = -this.offsetY + newPosition.y;
      if (nextY !== this.target.y || nextX !== this.target.x) {
        // console.log("dragging", this.target.x, this.target.y);
        this.target.x = nextX;
        this.target.y = nextY;
        this.dragging = true;
      }
    }
  };
}

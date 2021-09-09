export interface Shape {
  borderRadius: number | string;
}

export type ShapeOptions = Partial<Shape>;

export const shape: Shape = {
  borderRadius: 4,
};

import * as chroma from "chroma.ts";
export type TColor =
  | string
  | [r: number, g: number, b: number]
  | [r: number, g: number, b: number, a: number];
export function fade(color: TColor, amount: number | string): string {
  return chroma
    .color(color)
    .alpha(parseFloat(amount as string) / 100)
    .css();
}

function clamp(val: number) {
  return Math.min(1, Math.max(0, val));
}
export function darken(color: TColor, amount: number) {
  const ccc = chroma.color(color);
  const [a, b, c] = ccc.hsl();
  if (c === 0) return ccc.css();
  return chroma.color([a, b, clamp(c - amount / 100)], "hsl").hex("rgb");
}

export function lighten(color: TColor, amount: number) {
  const ccc = chroma.color(color);
  const [a, b, c] = ccc.hsl();
  if (c === 1) return ccc.css();
  return chroma.color([a, b, clamp(c + amount / 100)], "hsl").hex("rgb");
}
export function hsv(h: number, s: number, v: number): string {
  return chroma.hsv(h, s, v).hex("rgb");
}
export function hsva(h: number, s: number, v: number, amount: number): string {
  return chroma.hsv(h, s, v).alpha(amount).css();
}

export const { ceil } = Math;

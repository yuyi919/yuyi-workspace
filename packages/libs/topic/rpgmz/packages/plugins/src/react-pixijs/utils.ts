import { Graphics, Texture } from "pixi.js";

/**
 * 创建三角形
 * @param {*} xPos  三角形x位置
 * @param {*} yPos  三角形y位置
 * @param {*} color 三角形颜色
 */
export function createtriangle(xPos: any, yPos: any, color: any = 0xffffff) {
  const triangle = new Graphics();

  triangle.x = xPos;
  triangle.y = yPos;

  const triangleWidth = 34,
    triangleHeight = triangleWidth,
    triangleHalfway = triangleWidth / 2;

  // draw triangle
  triangle.beginFill(color, 0.8);
  triangle.lineStyle(0, color, 0.8);
  triangle.moveTo(triangleWidth, 0);
  triangle.lineTo(triangleHalfway, triangleHeight);
  triangle.lineTo(0, 0);
  triangle.lineTo(triangleHalfway, 0);
  triangle.endFill();

  return triangle;
}

/**
 * 线性渐变
 * https://jsfiddle.net/bigtimebuddy/Lu52dgmv/
 * @paramfrom 起始颜色
 * @param to 结束颜色
 */
export function gradient(from: string, to: string) {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  const grd = ctx.createLinearGradient(0, 0, 0, 500);
  grd.addColorStop(0, from);
  grd.addColorStop(0.8, to);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 500, 500);
  return Texture.from(c);
}

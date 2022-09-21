import { Vec } from "@tldraw/vec";

export function distanceBetween(
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  return Math.hypot(x2 - x1, y2 - y1);
}
export function angleBetween(x1: number, y1: number, x2: number, y2: number) {
  let x = x2 - x1;
  let y = y2 - y1;
  return Math.atan2(y, x); //* 180 / Math.PI
}
export function toDegrees(radian: number) {
  return (radian * 180) / Math.PI;
}
export function pointAlong(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  distance: number
) {
  const begin = [x1, y1];
  const end = [x2, y2];

  return Vec.add(begin, Vec.mul(Vec.normalize(Vec.sub(end, begin)), distance));
}

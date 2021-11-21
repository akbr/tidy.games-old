//@ts-nocheck
import { Styles } from "./types";

const shorthands = {
  translateX: "x",
  translateY: "y",
  rotate: "r",
  scale: "s",
};

const units = {
  x: (val: number | string) => (typeof val === "string" ? val : `${val}px`),
  y: (val: number | string) => (typeof val === "string" ? val : `${val}px`),
  r: (val: number | string) => (typeof val === "string" ? val : `${val}deg`),
};

const reg = /(\w+)\(([^)]*)\)/g;
export function extractTransforms(tranformStr: string | void) {
  if (!tranformStr) return {};
  let transforms = {};
  let m: RegExpExecArray;
  while ((m = reg.exec(tranformStr))) transforms[shorthands[m[1]]] = m[2];
  return transforms;
}

export function getTransforms(el: HTMLElement) {
  return extractTransforms(el.style.transform);
}

export const compileTransforms = ({ x = 0, y = 0, r = 0, s = 1 }: Styles) =>
  `translateX(${units.x(x)}) translateY(${units.y(y)}) rotate(${units.r(
    r
  )}) scale(${s})`;

export const stripStyles = (obj: Styles) => {
  let { transform, x, y, r, s, ...rest } = obj;
  return rest;
};

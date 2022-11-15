import type { SingleFrame, MultiFrame, Options, Value } from "./types";

const to = (unit: string) => (n: number) => `${n}${unit}`;
const unitGlossary: Record<string, (n: number) => string> = {
  x: to("px"),
  y: to("px"),
  rotate: to("deg"),
  top: to("px"),
  left: to("px"),
  right: to("px"),
  bottom: to("px"),
  width: to("px"),
  height: to("px"),
};

export const convertValue = (key: string, value: Value) => {
  if (typeof value === "string") return value;
  if (unitGlossary[key]) return unitGlossary[key](value);
  return String(value);
};

export function convertFrameValues(block: SingleFrame | MultiFrame) {
  const next: Record<string, string | string[]> = {};
  for (let key in block) {
    //@ts-ignore
    const value = block[key];
    if (value === undefined) continue;
    const nextValue = Array.isArray(value)
      ? value.map((subValue) => convertValue(key, subValue))
      : convertValue(key, value);
    next[key] = nextValue;
  }
  return next;
}

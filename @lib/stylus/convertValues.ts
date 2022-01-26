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

export const convertValue = (
  key: string,
  value: Value,
  index: number,
  length: number
) => {
  const resolvedValue =
    typeof value === "function" ? value(index, length) : value;
  return typeof resolvedValue === "string"
    ? resolvedValue
    : unitGlossary[key]
    ? unitGlossary[key](resolvedValue)
    : String(resolvedValue);
};

export function convertFrameValues(
  block: SingleFrame | MultiFrame,
  index: number,
  length: number
) {
  const next: Record<string, string | string[]> = {};
  for (let key in block) {
    //@ts-ignore
    const value = block[key];
    if (value === undefined) continue;
    const nextValue = Array.isArray(value)
      ? value.map((subValue) => convertValue(key, subValue, index, length))
      : convertValue(key, value, index, length);
    next[key] = nextValue;
  }
  return next;
}

export function convertOptionValues(
  obj: Record<string, any>,
  index: number,
  length: number
) {
  const next: Record<string, any> = {};
  for (let key in obj) {
    const value = obj[key];
    const nextValue =
      typeof value === "function" ? value(index, length) : value;
    next[key] = nextValue;
  }
  if (!next.easing) next.easing = "ease";
  return next;
}

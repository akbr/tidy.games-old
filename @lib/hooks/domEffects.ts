import type { DOMEffect } from ".";
import { style } from "@lib/stylus";

const vFadeInOutAnims = {
  in: [{ opacity: 0, y: -10 }, { opacity: 1 }],
  out: [{ opacity: 1 }, { opacity: 0, y: -10 }],
};
export const vFadeInOut: DOMEffect<"in" | "out"> = ($el, curr, prev) => {
  if (curr === prev) return;
  return style($el, vFadeInOutAnims[curr], {
    duration: curr == "in" ? 750 : 250,
  });
};

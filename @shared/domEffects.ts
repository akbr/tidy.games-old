import type { DOMEffect } from "@lib/hooks/useDomEffect";
import { style } from "@lib/stylus";

const fadeStyles = {
  in: [{ opacity: 0, y: -10 }, { opacity: 1 }],
  out: [{ opacity: 1 }, { opacity: 0, y: -10 }],
};
export const fade: DOMEffect<"in" | "out"> = ($el, prop) =>
  style($el, fadeStyles[prop], {
    duration: prop == "in" ? 750 : 250,
  });

import { Styles, FnValue } from "./types";
import { Task } from "../timing";

export function applyStyles(el: HTMLElement, styles: Styles) {
  Object.entries(styles).forEach(([key, value]) => {
    //@ts-ignore
    el.style[key] = value;
  });
}

export function wrap<T>(input: T | T[]): T[] {
  return Array.isArray(input) ? input : [input];
}

export function resolveFnValues<T>(
  obj: {
    [key: string]: T | FnValue<T>;
  },
  idx: number,
  length: number
): { [key: string]: T } {
  let next: { [key: string]: T } = {};
  Object.entries(obj).forEach(([key, val]) => {
    //@ts-ignore
    next[key] = typeof val === "function" ? val(idx, length) : val;
  });
  return next;
}

export function createAnimationTask(
  anim: Animation,
  el: HTMLElement,
  commitStyles: Styles
): Task {
  let done = false;
  anim.finished.then(() => {
    if (done) return;
    done = true;
    applyStyles(el, commitStyles);
  });
  return {
    finish: () => {
      applyStyles(el, commitStyles);
      done = true;
      anim.finish();
    },
    finished: anim.finished
  };
}

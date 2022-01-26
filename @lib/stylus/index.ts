import type { SingleFrame, MultiFrame, Options } from "./types";
import { all, Task } from "../async";
import { runElement } from "./runElement";

export function style(
  els: Element | Element[],
  styleKeyframes: SingleFrame | MultiFrame[],
  options?: Options
) {
  els = Array.isArray(els) ? els : [els];

  const tasks: Task<any>[] = [];
  els.forEach(($el, i, arr) => {
    const result = runElement($el, styleKeyframes, i, arr.length, options);
    if (result) tasks.push(result as Task<any>);
  });

  return tasks.length ? all(tasks) : undefined;
}

import type { SingleFrame, MultiFrame, Options } from "./types";
import { all, Task } from "../async/task";
import { runElement } from "./runElement";
import { addTask } from "./taskWeakMap";

const anims: WeakMap<Element, Task<Animation>[]> = new WeakMap();

export function style(
  els: Element | Element[],
  styleKeyframes: SingleFrame | MultiFrame[],
  options?: Options
) {
  els = Array.isArray(els) ? els : [els];

  const tasks: Task<Animation>[] = [];
  els.forEach(($el, i, arr) => {
    const animTask = runElement($el, styleKeyframes, i, arr.length, options);
    if (animTask) {
      tasks.push(animTask);
      addTask($el, animTask);
    }
  });

  return tasks.length ? all(tasks) : undefined;
}

export default style;

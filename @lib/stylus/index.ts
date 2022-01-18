import { Els, RawStylesBlock, StylesInput, Options } from "./types";
import { Task } from "../timing";

import {
  extractTransforms,
  compileTransforms,
  stripStyles,
} from "./transforms";
import {
  applyStyles,
  wrap,
  resolveFnValues,
  createAnimationTask,
} from "./utils";
import { all } from "../timing";

export function style(elInput: Els, stylesInput: StylesInput): void;
export function style(
  elInput: Els,
  stylesInput: StylesInput,
  options: Options
): Task;
export function style(
  elInput: Els,
  stylesInput: StylesInput,
  options?: Options
) {
  let els: HTMLElement[] = wrap(elInput) as HTMLElement[];

  let allStyles: RawStylesBlock[][] = Array.isArray(stylesInput)
    ? [stylesInput]
    : typeof stylesInput === "function"
    ? els.map((_, idx, arr) => wrap(stylesInput(idx, arr.length)))
    : [[stylesInput]];

  let allOptions: RawStylesBlock[];
  if (options) {
    allOptions =
      typeof options === "function"
        ? els.map((_, idx, arr) => options(idx, arr.length))
        : [options];
  }

  let tasks = els.map((el, index, arr) => {
    let myStyleList =
      typeof stylesInput === "function" ? allStyles[index] : allStyles[0];
    let baseTransforms = extractTransforms(el.style.transform);

    let myStyleBlocks = myStyleList.map((rawStyles) => {
      let styles = resolveFnValues(rawStyles, index, arr.length);
      let stringTransforms = extractTransforms(styles.transform as string);
      let transform = compileTransforms({
        ...baseTransforms,
        ...stringTransforms,
        ...styles,
      });
      return {
        ...stripStyles(styles),
        transform,
      };
    });

    let lastStyleBlock = myStyleBlocks[myStyleBlocks.length - 1];

    if (!options) {
      return applyStyles(el, lastStyleBlock);
    }

    let myOptions =
      typeof options === "function"
        ? resolveFnValues(allOptions[index], index, arr.length)
        : resolveFnValues(allOptions[0], index, arr.length);

    myOptions.easing = myOptions.easing || "ease";

    let task = createAnimationTask(
      el.animate(myStyleBlocks, myOptions),
      el,
      lastStyleBlock
    );

    return task;
  });

  return options ? all(tasks as Task[]) : undefined;
}

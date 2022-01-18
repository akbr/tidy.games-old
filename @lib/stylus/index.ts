import type { Styles, Options } from "./types";
import {
  resolveValues,
  ensureArray,
  setStyles,
  stylesAreRedundant,
  createAnimationWrapper,
} from "./core";
import { setUnits } from "./units";
import { applyTransforms } from "./transforms";

export function style(
  els: Element | Element[],
  inputStyles: Styles | Styles[],
  options?: Options | Options[]
) {
  const elsArr = ensureArray(els);
  const length = elsArr.length;

  const stylesArr = Array.isArray(inputStyles)
    ? inputStyles
    : Array.from({ length }, () => inputStyles);
  const compiledStyles = stylesArr
    .map((styles, idx) => resolveValues(styles, idx, length))
    .map(setUnits)
    .map((styles, idx) => applyTransforms(styles, elsArr[idx]));

  const optionsArr = Array.isArray(options)
    ? options
    : Array.from({ length }, () => options);
  const compiledOptions = optionsArr.map(
    (options, idx) => options && resolveValues(options, idx, length)
  );

  const results = elsArr.map(($el, idx) => {
    const styles = compiledStyles[idx];
    const options = compiledOptions[idx];

    if (!styles) return undefined;

    if (!options) {
      setStyles($el, styles);
      return undefined;
    }

    if (stylesAreRedundant($el, styles)) {
      return null;
    }

    return createAnimationWrapper($el, styles, options);
  });

  return results;
}

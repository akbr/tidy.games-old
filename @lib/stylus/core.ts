import type { Resolvable } from "./types";

export function ensureArray<T>(arg: T | T[]) {
  return Array.isArray(arg) ? arg : [arg];
}

export function setStyles($el: Element, styles: Record<string, string>) {
  for (const key in styles) {
    ($el as HTMLElement).style[key as any] = styles[key];
  }
}

export function resolveValues(
  inputStyles: Resolvable,
  idx: number,
  length: number
) {
  const resolved: Record<string, string | number> = {};
  for (let key in inputStyles) {
    const initValue = inputStyles[key];
    if (initValue === undefined) continue;
    resolved[key] =
      typeof initValue === "function" ? initValue(idx, length) : initValue;
  }
  return resolved;
}

export function stylesAreRedundant(
  $el: Element,
  styles: Record<string, string>
) {
  for (const key in styles) {
    if (($el as HTMLElement).style[key as any] !== styles[key]) return false;
  }
  return true;
}

export function createAnimationWrapper(
  $el: Element,
  styles: Record<string, string>,
  options: Record<string, string | number>
) {
  let done = false;

  const anim = $el.animate(styles, options);

  const setDone = () => {
    done = true;
    setStyles($el, styles);
  };

  anim.finished.then(() => {
    if (done) return;
    setDone();
  });

  return {
    skip: () => {
      setDone();
      anim.finish();
    },
    finished: anim.finished,
  };
}

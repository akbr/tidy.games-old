import { Task } from "@lib/async/task";

const SPECIAL_KEYS = new Set(["offeset", "easing", "composite"]);
export const getCommitStyles = (
  styles: Record<string, string | string[]> | Record<string, string>
) => {
  const commitStyles: Record<string, string> = {};
  for (let key in styles) {
    if (SPECIAL_KEYS.has(key)) continue;

    const value = styles[key];
    if (Array.isArray(value)) {
      commitStyles[key] = value[value.length - 1];
    } else {
      commitStyles[key] = value;
    }
  }
  return commitStyles;
};

export function setStyles($el: Element, styles: Record<string, string>) {
  for (const key in styles) {
    ($el as HTMLElement).style[key as any] = styles[key];
  }
}
export function stylesAreIdentical(
  $el: Element,
  styles: Record<string, string>
) {
  for (const key in styles) {
    if (($el as HTMLElement).style[key as any] !== styles[key]) return false;
  }
  return true;
}

export function createAnimationTask(
  $el: Element,
  styles: Record<string, any>,
  commitStyles: Record<string, string>,
  options: KeyframeAnimationOptions
): Task<Animation> {
  let done = false;

  const anim = $el.animate(styles, options);

  const setDone = () => {
    done = true;
    setStyles($el, commitStyles);
  };

  anim.finished.then(() => {
    if (done) return;
    setDone();
  });

  return {
    finished: anim.finished,
    skip: () => {
      if (done) return;
      setDone();
      anim.finish();
    },
  };
}

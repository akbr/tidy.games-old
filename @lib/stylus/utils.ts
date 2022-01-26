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

export function createAnimation(
  $el: Element,
  styles: Record<string, any>,
  commitStyles: Record<string, string>,
  options: KeyframeAnimationOptions
) {
  let done = false;

  const anim = $el.animate(styles, options) as Animation & { skip: () => void };

  const setDone = () => {
    done = true;
    setStyles($el, commitStyles);
  };

  anim.finished.then(() => {
    if (done) return;
    setDone();
  });

  anim.skip = () => {
    setDone();
    anim.finish();
  };

  return anim;
}

const shorthands: Record<string, string> = {
  translateX: "x",
  translateY: "y",
  rotate: "r",
  scale: "s",
};

export function extractTransforms(tranformStr: string) {
  const transforms: Record<string, string> = {};
  const reg = /(\w+)\(([^)]*)\)/g;
  let m: RegExpExecArray | null;
  /* eslint-disable no-cond-assign */
  while ((m = reg.exec(tranformStr))) {
    if (shorthands[m[1]]) transforms[shorthands[m[1]]] = m[2];
  }
  return transforms;
}

export const createTransformString = ({
  x = "0px",
  y = "0px",
  r = "0deg",
  s = "1",
}: Record<string, string>) =>
  `translateX(${x}) translateY(${y}) rotate(${r}) scale(${s})`;

function stripUndefined<T>(obj: Record<string, T>) {
  const next: Record<string, T> = {};
  for (let i in obj) if (obj[i] !== undefined) next[i] = obj[i];
  return next;
}

function hasIndividualTransforms({ x, y, s, r }: Record<string, string>) {
  return (
    x !== undefined || y !== undefined || s !== undefined || r !== undefined
  );
}

export function applyTransforms(styles: Record<string, string>, el?: Element) {
  if (!hasIndividualTransforms(styles)) return styles;

  const { transform, x, y, r, s, ...nextStyles } = styles;

  if (transform) {
    nextStyles.transform = transform;
    return nextStyles;
  }

  const nextTransforms = stripUndefined({ x, y, r, s });

  const prevTransforms = el
    ? extractTransforms((el as HTMLElement).style.transform)
    : {};

  nextStyles.transform = createTransformString({
    ...prevTransforms,
    ...nextTransforms,
  });

  return nextStyles;
}

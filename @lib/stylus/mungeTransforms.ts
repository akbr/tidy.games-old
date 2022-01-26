const shorthands: Record<string, string> = {
  translateX: "x",
  translateY: "y",
  rotate: "rotate",
  scale: "scale",
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
  rotate = "0deg",
  scale = "1",
}: Record<string, string>) =>
  `translateX(${x}) translateY(${y}) rotate(${rotate}) scale(${scale})`;

function stripUndefined<T>(obj: Record<string, T>) {
  const next: Record<string, T> = {};
  for (let i in obj) if (obj[i] !== undefined) next[i] = obj[i];
  return next;
}

export function mungeTransforms(
  styles: Record<string, string | string[]>,
  currentTransformString: string
) {
  const { x, y, rotate, scale, ...nextStyles } = styles;

  const transforms = [x, y, rotate, scale];

  if (!transforms.find((x) => x !== undefined)) return styles;

  if (transforms.find((x) => Array.isArray(x)))
    throw new Error("Cannot use array keyframes for individual transforms.");

  nextStyles.transform = createTransformString({
    ...extractTransforms(currentTransformString),
    ...(stripUndefined({ x, y, rotate, scale }) as Record<string, string>),
  });

  return nextStyles;
}

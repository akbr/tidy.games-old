export function patchTransforms(styles: Record<string, string | string[]>) {
  const { x, y, rotate, scale, ...nextStyles } = styles;

  if ([x, y, rotate, scale].find(Array.isArray))
    throw new Error("Cannot use array keyframes for individual transforms.");

  const transforms: Record<string, any> = {};

  if (x !== undefined || y !== undefined) {
    transforms.translate = `${x || 0} ${y || 0}`;
  }

  if (rotate !== undefined) {
    transforms.rotate = rotate;
  }

  if (scale !== undefined) {
    transforms.scale = scale;
  }

  return {
    ...nextStyles,
    ...transforms,
  };
}

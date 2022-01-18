type Converter = (n: number) => string;

const to = (unit: string) => (n: number) => `${n}${unit}`;
const toPx = to("px");
const toDeg = to("deg");

const unitGlossary: Record<string, Converter> = {
  x: toPx,
  y: toPx,
  r: toDeg,
  top: toPx,
  left: toPx,
  right: toPx,
  bottom: toPx,
  width: toPx,
  height: toPx,
};

export function setUnits(styles: Record<string, string | number>) {
  const nextStyles: Record<string, string> = {};
  for (let key in styles) {
    const value = styles[key];
    nextStyles[key] =
      typeof value === "string"
        ? value
        : unitGlossary[key]
        ? unitGlossary[key](value)
        : String(value);
  }
  return nextStyles;
}

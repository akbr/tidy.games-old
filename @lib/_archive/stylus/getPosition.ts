import { is } from "@lib/compare/is";

export type Unit = number | string;
export const convert = (x: Unit, def = "px") =>
  typeof x === "string" ? x : `${x}${def}`;

export type PosProps = {
  left?: Unit;
  right?: Unit;
  top?: Unit;
  bottom?: Unit;
  x?: Unit;
  y?: Unit;
  rotate?: Unit;
  scale?: Unit;
};

export const getPosition = ({
  left,
  right,
  top,
  bottom,
  x,
  y,
  rotate,
  scale,
}: PosProps) => {
  const styles: Partial<
    Record<"left" | "right" | "top" | "bottom" | "transform", string>
  > = {};
  const transforms: string[] = [];

  if (is.defined(left)) styles.left = convert(left);
  if (is.defined(right)) styles.right = convert(right);
  if (is.defined(top)) styles.top = convert(top);
  if (is.defined(bottom)) styles.bottom = convert(bottom);

  if (is.defined(x)) transforms.push(`translateX(${convert(x)})`);
  if (is.defined(y)) transforms.push(`translateY(${convert(y)})`);
  if (is.defined(rotate)) transforms.push(`rotate(${convert(rotate, "deg")})`);
  if (is.defined(scale)) transforms.push(`scale(${convert(scale, "")})`);

  if (transforms.length) styles.transform = transforms.join(" ");

  return styles;
};
export default getPosition;

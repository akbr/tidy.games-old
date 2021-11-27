import { style } from "@lib/stylus";

const getMaxInRow = (containerWidth: number, xPeek: number) =>
  Math.floor(containerWidth / xPeek);

const getNumRows = (
  numChildren: number,
  containerWidth: number,
  xPeek: number
) => Math.ceil(numChildren / getMaxInRow(containerWidth, xPeek));

export const getHandHeight = (
  numChildren: number,
  containerWidth: number,
  xPeek: number,
  yPeek: number
) => getNumRows(numChildren, containerWidth, xPeek) * yPeek;

export const getHandPositions = (
  children: unknown[],
  containerDimensions: number[],
  childWidth: number,
  xPeek: number,
  yPeek: number
) => {
  const [containerWidth, containerHeight] = containerDimensions;
  const maxInRow = getMaxInRow(containerWidth, xPeek);
  const numRows = getNumRows(children.length, containerWidth, xPeek);

  const shortBy = numRows * maxInRow - children.length;

  return children.map((_, idx) => {
    const rowNum = Math.trunc((idx + shortBy) / maxInRow);
    const isFirstRow = rowNum === 0;
    if (!isFirstRow) idx = idx + shortBy;

    const pos = {
      x: (idx % maxInRow) * xPeek,
      y: containerHeight - (rowNum + 1) * yPeek,
    };
    const numInRow = isFirstRow ? maxInRow - shortBy : maxInRow;
    const adj = containerWidth - (xPeek * (numInRow - 1) + childWidth);
    if (adj > 0) pos.x += adj / 2;
    return pos;
  });
};

type PositionHandProps = {
  containerDimensions: number[];
  anim: "initial" | null;
  xPeek?: number;
  yPeek?: number;
};

export const positionHand = (
  $root: HTMLElement,
  { anim, containerDimensions, xPeek = 35, yPeek = 60 }: PositionHandProps
) => {
  const children = Array.from($root.childNodes) as HTMLElement[];
  if (children.length === 0) return;

  const childRect = children[0].getBoundingClientRect();
  const [containerWidth, containerHeight] = containerDimensions;

  let positions = getHandPositions(
    children,
    containerDimensions,
    childRect.width,
    xPeek,
    yPeek
  );

  style(children, {
    position: "absolute",
  });

  if (anim === "initial") {
    style(children, (idx) => ({
      x: positions[idx].x,
      y: positions[idx].y + (yPeek + 10),
      r: 0,
    }));
  }

  style(
    children,
    (idx) => ({ ...positions[idx], r: 0 }),
    anim
      ? {
          duration: 250,
        }
      : {}
  );
};

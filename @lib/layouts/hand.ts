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
  containerWidth: number,
  childWidth: number,
  xPeek: number,
  yPeek: number
) => {
  const maxInRow = getMaxInRow(containerWidth, xPeek);
  const numRows = getNumRows(children.length, containerWidth, xPeek);

  const shortBy = numRows * maxInRow - children.length;

  return children.map((_, idx) => {
    const rowNum = Math.trunc((idx + shortBy) / maxInRow);
    const isFirstRow = rowNum === 0;
    if (!isFirstRow) idx = idx + shortBy;

    const pos = {
      x: (idx % maxInRow) * xPeek,
      y: rowNum * yPeek,
    };
    const numInRow = isFirstRow ? maxInRow - shortBy : maxInRow;
    const adj = containerWidth - (xPeek * (numInRow - 1) + childWidth);
    if (adj > 0) pos.x += adj / 2;
    return pos;
  });
};

type PositionHandProps = {
  anim: "initial" | null;
  xPeek?: number;
  yPeek?: number;
  hand: string[];
  didRefresh?: Symbol;
};

export const positionHand = (
  $root: HTMLElement,
  { anim, xPeek = 35, yPeek = 50 }: PositionHandProps
) => {
  const children = Array.from($root.childNodes) as HTMLElement[];
  if (children.length === 0) return;

  const containerRect = $root.getBoundingClientRect();
  const childRect = children[0].getBoundingClientRect();

  const containerHeight = getHandHeight(
    children.length,
    containerRect.width,
    xPeek,
    yPeek
  );

  let positions = getHandPositions(
    children,
    containerRect.width,
    childRect.width,
    xPeek,
    yPeek
  );

  style($root, {
    height: containerHeight,
  });

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

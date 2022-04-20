type Dimensions = { width: number; height: number };

export const getHandHeight = (
  numChildren: number,
  { width }: Dimensions,
  xPeek: number,
  yPeek: number
) => Math.ceil(numChildren / Math.floor(width / xPeek)) * yPeek;

export const getIntraHandPosition = (
  childIdx: number,
  numChildren: number,
  { width, height }: Dimensions,
  childWidth: number,
  xPeek: number,
  yPeek: number
) => {
  const maxInRow = Math.floor(width / xPeek);
  const numRows = Math.ceil(numChildren / maxInRow);

  const rowIdx = Math.floor(childIdx / maxInRow);
  const childIdxInRow = childIdx % maxInRow;
  const remainingCards = numChildren - (childIdx + 1);
  const numInRow =
    childIdxInRow + remainingCards >= maxInRow
      ? maxInRow
      : childIdxInRow + remainingCards + 1;

  const rowWidth = xPeek * numInRow + (childWidth - xPeek);
  const rowExtraSpace = width - rowWidth;
  const xBuffer = rowExtraSpace > 0 ? rowExtraSpace / 2 : 0;
  const yBuffer = height - yPeek;

  return {
    zIndex: numRows - rowIdx,
    x: childIdxInRow * xPeek + xBuffer,
    y: -rowIdx * yPeek + yBuffer,
  };
};

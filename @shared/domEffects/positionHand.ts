import { all } from "@lib/async/task";
import { randomIntBetween } from "@lib/random";
import { style } from "@lib/style";

const X_PEEK = 35;
const Y_PEEK = 60;

export const getHandHeight = (
  numChildren: number,
  containerWidth: number,
  xPeek = X_PEEK,
  yPeek = Y_PEEK
) => Math.ceil(numChildren / Math.floor(containerWidth / xPeek)) * yPeek;

export const getCardStyles = (
  childIdx: number,
  numChildren: number,
  containerWidth: number,
  containerHeight: number,
  childWidth: number,
  xPeek = X_PEEK,
  yPeek = Y_PEEK
) => {
  const maxInRow = Math.floor(containerWidth / xPeek);
  const numRows = Math.ceil(numChildren / maxInRow);

  const rowIdx = Math.floor(childIdx / maxInRow);
  const childIdxInRow = childIdx % maxInRow;
  const remainingCards = numChildren - (childIdx + 1);
  const numInRow =
    childIdxInRow + remainingCards >= maxInRow
      ? maxInRow
      : childIdxInRow + remainingCards + 1;

  const rowWidth = xPeek * numInRow + (childWidth - xPeek);
  const rowExtraSpace = containerWidth - rowWidth;
  const xBuffer = rowExtraSpace > 0 ? rowExtraSpace / 2 : 0;
  const yBuffer = containerHeight - yPeek;

  return {
    zIndex: numRows - rowIdx,
    x: childIdxInRow * xPeek + xBuffer,
    y: -rowIdx * yPeek + yBuffer,
  };
};

export const positionHand = (
  $handContainer: HTMLElement,
  options?: { xPeek?: number; yPeek?: number; deal?: boolean }
) => {
  const { xPeek, yPeek, deal } = options || {};
  const rect = $handContainer.getBoundingClientRect();
  const cardEls = Array.from($handContainer.children) as HTMLElement[];

  if (cardEls.length === 0) return;

  const cardWidth = cardEls[0].getBoundingClientRect().width;

  const handHeight = getHandHeight(cardEls.length, rect.width);

  const tasks = cardEls.map(($card, idx) => {
    const cardStyles = getCardStyles(
      idx,
      cardEls.length,
      rect.width,
      window.innerHeight,
      cardWidth,
      xPeek,
      yPeek
    );

    const end = { ...cardStyles, opacity: 1, rotate: 0 };

    if (deal) {
      const start = {
        ...end,
        y: end.y + handHeight + 10,
        rotate: randomIntBetween(-5, -15),
      };
      style($card, start);
      return style($card, end, { duration: 1000 })!;
    }

    return style($card, end, { duration: 250 })!;
  });

  return all(tasks);
};

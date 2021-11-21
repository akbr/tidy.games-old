import { Dimensions } from "./layout";

export const X_PEEK = 35;
export const Y_PEEK = 65;

const getMaxInRow = ({ w }: Dimensions) => Math.floor(w / X_PEEK);
const getNumRows = (surface: Dimensions, numCards: number) =>
  Math.ceil(numCards / getMaxInRow(surface));

export const getHandHeight = (surface: Dimensions, numCards: number) =>
  getNumRows(surface, numCards) * Y_PEEK;

export const getHandPositions = (
  hand: unknown[],
  surface: Dimensions,
  card: Dimensions
) => {
  let maxInRow = getMaxInRow(surface);
  let numRows = getNumRows(surface, hand.length);
  let shortBy = numRows * maxInRow - hand.length;

  return hand.map((_, cardIndex) => {
    let rowNum = Math.trunc((cardIndex + shortBy) / maxInRow);
    let isFirstRow = rowNum === 0;
    if (!isFirstRow) cardIndex = cardIndex + shortBy;

    let pos = {
      x: (cardIndex % maxInRow) * X_PEEK,
      y: rowNum * Y_PEEK
    };
    let numInRow = isFirstRow ? maxInRow - shortBy : maxInRow;

    let adj = surface.w - (X_PEEK * (numInRow - 1) + card.w);

    if (adj > 0) pos.x += adj / 2;
    pos.y += surface.h - numRows * Y_PEEK;
    return pos;
  });
};

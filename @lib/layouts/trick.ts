import { Vec, toXY } from "@lib/vector";
import { getSeatPosition, getSeatDirectionVector } from "./seats";

import { style } from "@lib/stylus";
import { getTransforms } from "@lib/stylus/transforms";
import { seq } from "@lib/timing";
import { randomBetween } from "@lib/random";
import { rotateIndex } from "@lib/array";
import shallow from "zustand/shallow";

export const getHeldCoords = (
  numPlayers: number,
  seatIndex: number,
  parentDim: number[],
  childDim: number[]
) => {
  const buffer = [1.3, 1.3];
  const seat = getSeatPosition(numPlayers, seatIndex, parentDim);
  const direction = getSeatDirectionVector(numPlayers, seatIndex);
  const heldOffset = Vec.mulV(Vec.mul(direction, -1), childDim, buffer);
  const cardCenter = Vec.mul(childDim, -0.5);

  return toXY(Vec.add(seat, heldOffset, cardCenter));
};

export const getPlayedCoords = (
  numPlayers: number,
  seatIndex: number,
  parentDim: number[],
  childDim: number[]
) => {
  const minYRatio = 0.33;
  const seat = getSeatPosition(numPlayers, seatIndex, parentDim);
  const direction = getSeatDirectionVector(numPlayers, seatIndex);

  const playOffset = Vec.mulV(direction, [
    parentDim[0] / 2,
    parentDim[1] * minYRatio,
  ]);
  const padding = Vec.mulV(Vec.mul(direction, -1), [
    childDim[0] + 12,
    childDim[1] / 2,
  ]);
  const cardCenter = Vec.mul(childDim, -0.5);

  return toXY(Vec.add(seat, playOffset, padding, cardCenter));
};

// ----- !!!!!-------

export type PlayProps = {
  numPlayers: number;
  startPlayer: number;
  playerIndex: number;
  winningIndex?: number;
  didRefresh?: Symbol;
};

const getChildArray = ($el: HTMLElement) =>
  Array.from($el.childNodes) as HTMLElement[];
const getDimensionVec = ($el: HTMLElement) => {
  const rect = $el.getBoundingClientRect();
  return [rect.width, rect.height];
};

export const positionTrick = (
  $parent: HTMLElement,
  { numPlayers, startPlayer, playerIndex, winningIndex }: PlayProps,
  prev?: PlayProps
) => {
  const trick = getChildArray($parent);
  if (trick.length === 0) return;

  const parentDim = getDimensionVec($parent);
  const childDim = getDimensionVec(trick[0]);

  // Calculate positions
  // -------------------
  const modSeatIndexes = trick.map((_, i) =>
    rotateIndex(numPlayers, i, startPlayer - playerIndex)
  );

  const playedCoords = modSeatIndexes.map((idx) =>
    getPlayedCoords(numPlayers, idx, parentDim, childDim)
  );

  const heldCoords = modSeatIndexes.map((idx) =>
    getHeldCoords(numPlayers, idx, parentDim, childDim)
  );

  // Basic reset
  // -----------
  const lastIndex = trick.length - 1;
  const $lastCard = trick[lastIndex];
  const lastPosition = getTransforms($lastCard);
  style(trick, (i) => ({ ...playedCoords[i], r: 0 }));

  // Bail if resize
  // --------------
  //if (isResize) return;

  // Build
  // --------------
  const playedByUser =
    rotateIndex(numPlayers, trick.length - 1, startPlayer) === playerIndex;

  const timeline = [
    () => {
      style(
        $lastCard,
        playedByUser
          ? lastPosition
          : {
              x: heldCoords[lastIndex].x,
              y: heldCoords[lastIndex].y,
            }
      );
    },
    () =>
      style($lastCard, playedCoords[lastIndex], {
        duration: playedByUser ? 200 : randomBetween(300, 500),
      }),
  ];

  if (winningIndex === undefined) return seq(timeline);

  // Win animation
  // -------------
  const waggleFrames = (amt: number, amt2: number) => {
    const getAmt = () => randomBetween(amt, amt2);
    return [0, getAmt(), 0, -getAmt(), 0, getAmt(), -getAmt() / 4].map((r) => ({
      r,
    }));
  };

  const $winningCard = trick[winningIndex];
  const $losingCards = trick.filter((el) => el !== $winningCard);

  $parent.appendChild($winningCard);

  timeline.push(() => {
    // Waggle winning card
    style($winningCard, waggleFrames(10, 20), {
      duration: 750,
      delay: 500,
    });
    // Coalesce losing cards
    style(
      $losingCards,
      {
        ...playedCoords[winningIndex],
        r: () => randomBetween(-20, 20),
      },
      { duration: 300, delay: 1350 }
    );
    // Pull in trick
    return style(
      trick,
      {
        ...heldCoords[winningIndex],
        r: 45,
      },
      { duration: 350, delay: 1700 }
    );
  });

  return seq(timeline);
};

import { style } from "../stylus";
import { getTransforms } from "../stylus/transforms";
import { seq } from "../timing";
import { randomBetween } from "../random";
import { rotateIndex } from "../array";

import { Dimensions } from "./layout";

import { memoizedCreate } from "./createCard";
import { getPlayedPosition, getHeldPosition } from "./playUpdate.calc";
import shallow from "zustand/shallow";

export type PlayProps = {
  numPlayers: number;
  playerPerspective: number;
  startPlayer: number;
  trick: string[];
  winningIndex?: number;
  cardDimensions?: Dimensions;
  tableDimensions?: Dimensions;
};

export const playUpdate = (
  $root: HTMLElement,
  {
    trick,
    numPlayers,
    startPlayer,
    playerPerspective,
    tableDimensions = { w: window.innerWidth, h: window.innerHeight },
    winningIndex,
    cardDimensions = { w: 80, h: 112 },
  }: PlayProps,
  prev?: PlayProps
) => {
  $root.innerHTML = "";
  if (trick.length === 0) return;

  // Calculate positions
  // -------------------
  const adjustedSeatIndexes = trick.map((_, i) =>
    rotateIndex(numPlayers, i, startPlayer - playerPerspective)
  );

  const playedPositions = trick.map((_, i) => ({
    ...getPlayedPosition(
      { numPlayers, seatIndex: adjustedSeatIndexes[i] },
      tableDimensions,
      cardDimensions
    ),
    r: randomBetween(-1.5, 1.5, trick[i] + _),
  }));

  const heldPositions = trick.map((_, i) =>
    getHeldPosition(
      { numPlayers, seatIndex: adjustedSeatIndexes[i] },
      tableDimensions,
      cardDimensions
    )
  );

  // Basic reset
  // -----------
  const $trick = trick.map(memoizedCreate);
  const endIndex = $trick.length - 1;
  const $lastCard = $trick[endIndex];
  let lastPosition = getTransforms($lastCard);

  style($trick, (i) => playedPositions[i]);
  $trick.forEach((cardEl) => {
    $root.appendChild(cardEl);
  });

  // Bail if resize
  // --------------
  const isResize =
    prev && shallow(prev.trick, trick) && prev.winningIndex === winningIndex;
  if (isResize) return;

  // Build
  // --------------
  let playedByUser =
    rotateIndex(numPlayers, trick.length - 1, startPlayer) ===
    playerPerspective;

  const timeline = [
    () => {
      style(
        $lastCard,
        playedByUser
          ? lastPosition
          : {
              x: heldPositions[endIndex].x + randomBetween(-10, 10),
              y: heldPositions[endIndex].y + randomBetween(-10, 10),
              r: randomBetween(-25, 25),
            }
      );
    },
    () =>
      style($lastCard, playedPositions[endIndex], {
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

  let $winningCard = $trick[winningIndex];
  let $losingCards = $trick.filter((el) => el !== $winningCard);

  $root.appendChild($winningCard);

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
        ...playedPositions[winningIndex],
        r: () => randomBetween(-20, 20),
      },
      { duration: 300, delay: 1350 }
    );
    // Pull in trick
    return style(
      $trick,
      {
        ...heldPositions[winningIndex],
        r: 45,
      },
      { duration: 350, delay: 1700 }
    );
  });

  return seq(timeline);
};

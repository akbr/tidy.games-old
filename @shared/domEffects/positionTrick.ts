import { Vec, toXY } from "@lib/vector";
import { rotateArray } from "@lib/array";
import { randomBetween } from "@lib/random";
import { getNearestDimensions } from "@lib/dom";
import { style } from "@lib/style";
import { seq, delay, all } from "@lib/async/task";

import { getSeatPosition, getSeatDirectionVector } from "./positionSeats";

type Dimensions = { width: number; height: number };
const CHILD_DIMENSIONS = [80, 112];
const buffer = [0.8, 0.8];

export const getHeldPosition = (
  numPlayers: number,
  seatIndex: number,
  dimensions: Dimensions,
  childDimensions = CHILD_DIMENSIONS
) => {
  const seat = getSeatPosition(numPlayers, seatIndex, dimensions);
  const direction = getSeatDirectionVector(numPlayers, seatIndex);
  const heldOffset = Vec.mulV(Vec.mul(direction, -1), childDimensions, buffer);
  const cardCenter = Vec.mul(childDimensions, -0.5);

  return toXY(Vec.add(seat, heldOffset, cardCenter));
};

export const getCenterPlayedPosition = (
  { width, height }: Dimensions,
  childDimensions = CHILD_DIMENSIONS
) => {
  const screenCenter = Vec.mul([width, height], 0.5);
  const cardCenter = Vec.mul(childDimensions, -0.5);
  return toXY(Vec.add(screenCenter, cardCenter));
};

export const getPlayedPosition = (
  numPlayers: number,
  seatIndex: number,
  dimensions: Dimensions,
  childDimensions = CHILD_DIMENSIONS
) => {
  const minYRatio = 0.35;
  const seat = getSeatPosition(numPlayers, seatIndex, dimensions);
  const direction = getSeatDirectionVector(numPlayers, seatIndex);

  const playOffset = Vec.mulV(direction, [
    dimensions.width / 2,
    dimensions.height * minYRatio,
  ]);
  const padding = Vec.mulV(Vec.mul(direction, -1), [
    childDimensions[0] + 12,
    childDimensions[1] / 2,
  ]);
  const cardCenter = Vec.mul(childDimensions, -0.5);
  const positionVector = Vec.add(seat, playOffset, padding, cardCenter);

  return toXY(positionVector);
};

export const getWaggle = (amt: number, amt2: number) => {
  const getAmt = () => randomBetween(amt, amt2);
  return [0, getAmt(), 0, -getAmt(), 0, getAmt(), -getAmt() / 4];
};

export type TrickProps = {
  numPlayers: number;
  leadPlayer: number;
  perspective?: number;
  effect?:
    | { type: "none" }
    | { type: "played"; player: number }
    | { type: "won"; player: number };
};

export const positionTrick = (
  $trickContainer: HTMLElement,
  curr: TrickProps
) => {
  const {
    numPlayers,
    leadPlayer,
    perspective = 0,
    effect = { type: "none" },
  } = curr;
  // Create collections
  // ------------------
  const cardEls = Array.from($trickContainer.children) as HTMLElement[];
  if (cardEls.length === 0) return;

  const cardElsByPlayer = rotateArray(
    Array.from({ length: numPlayers }, (_, idx) => cardEls[idx]),
    leadPlayer
  ) as (HTMLElement | undefined)[];
  const cardElsByPerspective = rotateArray(cardElsByPlayer, -perspective);

  const [width, height] = getNearestDimensions(cardEls[0]);

  // Base styling
  // ------------
  cardElsByPerspective.forEach(($card, idx) => {
    if (!$card) return;
    style($card, {
      ...getPlayedPosition(numPlayers, idx, { width, height }),
      rotate: 0,
    });
  });

  // Play effect
  // -----------
  if (effect.type === "played" && effect.player !== perspective) {
    const $played = cardElsByPlayer[effect.player]!;
    const idx = cardElsByPerspective.indexOf($played);
    style($played, {
      ...getHeldPosition(numPlayers, idx, { width, height }),
      rotate: randomBetween(-40, 40),
      opacity: 0,
    });
    return style(
      $played,
      {
        ...getPlayedPosition(numPlayers, idx, { width, height }),
        rotate: 0,
        opacity: 1,
      },
      {
        duration: randomBetween(400, 600),
      }
    );
  }

  if (effect.type !== "won") return;

  // Win effect
  // ----------
  const $winningCard = cardElsByPlayer[effect.player];
  if (!$winningCard) return;

  const losingCards = cardEls.filter(($el) => $el !== $winningCard);

  $trickContainer.appendChild($winningCard);

  const winningPlayed = getPlayedPosition(
    numPlayers,
    cardElsByPerspective.indexOf($winningCard),
    { width, height }
  );

  const winningHold = getHeldPosition(
    numPlayers,
    cardElsByPerspective.indexOf($winningCard),
    { width, height }
  );

  return seq([
    () =>
      style(
        $winningCard,
        { rotate: getWaggle(10, 20) },
        {
          duration: 750,
          delay: 500,
        }
      ),
    () =>
      all(
        losingCards.map(
          ($card) =>
            style(
              $card,
              {
                ...winningPlayed,
                rotate: randomBetween(-30, 30),
              },
              { duration: 300, delay: 375 }
            )!
        )
      ),
    () =>
      all(
        cardEls.map(
          ($card) =>
            style(
              $card,
              {
                ...winningHold,
                rotate: 45,
              },
              { duration: 275, delay: 325 }
            )!
        )
      ),
    () => delay(500),
  ]);
};

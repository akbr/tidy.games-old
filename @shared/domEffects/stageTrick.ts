import { rotateArray } from "@lib/array";
import { randomBetween } from "@lib/random";
import { style } from "@lib/style";
import { seq, delay, all } from "@lib/async/task";

import {
  getHeldPosition,
  getPlayedPosition,
  getTrickScaling,
} from "./positionTrick";

export const getWaggle = (amt: number, amt2: number) => {
  const getAmt = () => randomBetween(amt, amt2);
  return [0, getAmt(), 0, -getAmt(), 0, getAmt(), -getAmt() / 4];
};

export type TrickProps = {
  numPlayers: number;
  leadPlayer: number;
  perspective?: number;
};

export const stageTrick = (
  $trickContainer: HTMLElement,
  containerDimensions: number[],
  curr: TrickProps,
  playDistanceVec: number[],
  effect?: { type: "played"; player: number } | { type: "won"; player: number }
) => {
  const { numPlayers, leadPlayer, perspective = 0 } = curr;

  // Create sparse array, altered for perspective
  // --------------------------------------------
  const cardEls = Array.from($trickContainer.children) as HTMLElement[];
  if (cardEls.length === 0) return;

  const cardElsByPlayer = rotateArray(
    Array.from({ length: numPlayers }, (_, idx) => cardEls[idx]),
    leadPlayer
  ) as (HTMLElement | undefined)[];
  const cardElsByPerspective = rotateArray(cardElsByPlayer, -perspective);

  // Get scaling information, depending on table size
  // ------------------------------------------------
  const { scale, scaledDimensions, playDistance } = getTrickScaling(
    numPlayers,
    containerDimensions,
    cardEls[0],
    playDistanceVec
  );

  // Base styling
  // ------------
  const playedPositions = cardElsByPerspective.map((_, idx) =>
    getPlayedPosition(
      numPlayers,
      idx,
      containerDimensions,
      scaledDimensions,
      playDistance,
      scale
    )
  );

  cardElsByPerspective.forEach(($card, idx) => {
    if (!$card) return;
    let [x, y] = playedPositions[idx];
    style($card, {
      x,
      y,
      scale,
      rotate: 0,
      opacity: 1,
    });
  });

  if (!effect) return;

  // Play effect
  // -----------
  if (effect.type === "played" && effect.player !== perspective) {
    const $played = cardElsByPlayer[effect.player]!;
    const idx = cardElsByPerspective.indexOf($played);

    const [heldX, heldY] = getHeldPosition(
      numPlayers,
      idx,
      containerDimensions,
      scaledDimensions,
      scale
    );

    style($played, {
      x: heldX,
      y: heldY,
      //rotate: randomBetween(-40, 40),
      opacity: 0,
    });

    const [playedX, playedY] = playedPositions[idx];
    return style(
      $played,
      {
        x: playedX,
        y: playedY,
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

  const winningIdx = cardElsByPerspective.indexOf($winningCard);

  const [winningX, winningY] = playedPositions[winningIdx];
  const [winningHeldX, winningHeldY] = getHeldPosition(
    numPlayers,
    winningIdx,
    containerDimensions,
    scaledDimensions,
    scale
  );

  return seq([
    () =>
      style(
        $winningCard,
        { rotate: getWaggle(10, 15) },
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
                x: winningX,
                y: winningY,
                rotate: randomBetween(-30, 30),
              },
              { duration: 300, delay: 400 }
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
                x: winningHeldX,
                y: winningHeldY,
                rotate: 45,
                opacity: [1, 0],
                scale: 0.5,
              },
              { duration: 400, delay: 325 }
            )!
        )
      ),
    () => delay(500),
  ]);
};

import { FunctionalComponent, h } from "preact";
import { useLayoutEffect, useRef } from "preact/hooks";
import equal from "fast-deep-equal";

import { useRefreshOnResize, useGameEffect } from "@lib/hooks";
import { style } from "@lib/stylus";
import { getNearestDimensions } from "@lib/dom";
import { getHeldPosition, getPlayedPosition } from "@lib/layouts/trick";
import { getWaggle } from "@lib/layouts/anim";

import { rotateArray } from "@lib/array";
import { randomBetween } from "@lib/random";
import { seq } from "@lib/async";

export type TrickProps = {
  numPlayers: number;
  leadPlayer: number;
  perspective?: number;
  effect?:
    | { type: "none" }
    | { type: "played"; player: number }
    | { type: "won"; player: number };
};

export const applyTrickStyles = (
  $trickContainer: HTMLElement,
  curr: TrickProps,
  prev?: TrickProps
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
  const cardElsByPlayer = rotateArray(
    Array.from({ length: numPlayers }, (_, idx) => cardEls[idx]),
    leadPlayer
  ) as (HTMLElement | undefined)[];
  const cardElsByPerspective = rotateArray(cardElsByPlayer, -perspective);

  const dimensions = getNearestDimensions($trickContainer!);

  // Base styling
  // ------------
  cardElsByPerspective.forEach(($card, idx) => {
    if (!$card) return;
    style($card, getPlayedPosition(numPlayers, idx, dimensions));
  });

  // If just a resize, return
  if (equal(curr, prev)) return;

  // Play effect
  // -----------
  if (effect.type === "played" && effect.player !== perspective) {
    const $played = cardElsByPlayer[effect.player]!;
    const idx = cardElsByPerspective.indexOf($played);
    style(
      $played,
      [
        getHeldPosition(numPlayers, idx, dimensions),
        getPlayedPosition(numPlayers, idx, dimensions),
      ],
      {
        duration: 300,
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

  const { x, y } = $winningCard.getBoundingClientRect();
  const winningHold = getHeldPosition(
    numPlayers,
    cardElsByPerspective.indexOf($winningCard),
    dimensions
  );

  return seq([
    () =>
      style($winningCard, getWaggle(10, 25), {
        duration: 750,
        delay: 500,
      }),
    () =>
      style(
        losingCards,
        {
          x,
          y,
          rotate: () => randomBetween(-30, 30),
        },
        { duration: 300, delay: 350 }
      ),
    () =>
      style(
        cardEls,
        {
          ...winningHold,
          rotate: 45,
        },
        { duration: 275, delay: 325 }
      ),
  ]);
};

export const TrickSection: FunctionalComponent<TrickProps> = (props) => {
  const ref = useRef<HTMLDivElement>(null);

  useRefreshOnResize();
  useGameEffect(applyTrickStyles, ref, props);

  return (
    <section id="trick" ref={ref}>
      {props.children}
    </section>
  );
};

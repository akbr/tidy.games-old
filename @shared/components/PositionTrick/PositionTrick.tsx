import { ComponentChildren } from "preact";

import { deep } from "@lib/compare/deep";
import { useRefreshOnResize, useDOMEffect, useShallowRef } from "@lib/hooks";
import { style } from "@lib/stylus";
import { getNearestDimensions } from "@lib/dom";
import { rotateArray } from "@lib/array";
import { randomBetween } from "@lib/random";
import { seq, delay } from "@lib/async/task";

import { getHeldPosition, getPlayedPosition, getWaggle } from "./trickLayout";
import { useRef } from "preact/hooks";

export const PositionTrick = ({
  children,
  ...props
}: TrickProps & { children: ComponentChildren }) => {
  useRefreshOnResize();
  const ref = useRef(null);
  const effectProps = useShallowRef(props);
  useDOMEffect(applyTrickStyles, ref, effectProps);

  return (
    <section ref={ref} id="trick" class="absolute top-0 left-0">
      {children}
    </section>
  );
};
export default PositionTrick;

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
    style($card, {
      ...getPlayedPosition(numPlayers, idx, dimensions),
      rotate: 0,
    });
  });

  if (deep(curr, prev)) return;

  // Play effect
  // -----------
  if (effect.type === "played" && effect.player !== perspective) {
    const $played = cardElsByPlayer[effect.player]!;
    const idx = cardElsByPerspective.indexOf($played);
    return style(
      $played,
      [
        {
          ...getHeldPosition(numPlayers, idx, dimensions),
          rotate: randomBetween(-40, 40),
        },
        {
          ...getPlayedPosition(numPlayers, idx, dimensions),
          rotate: 0,
        },
      ],
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
    dimensions
  );

  const winningHold = getHeldPosition(
    numPlayers,
    cardElsByPerspective.indexOf($winningCard),
    dimensions
  );

  return seq([
    () =>
      style($winningCard, getWaggle(10, 20), {
        duration: 750,
        delay: 500,
      }),
    () =>
      style(
        losingCards,
        {
          ...winningPlayed,
          rotate: () => randomBetween(-30, 30),
        },
        { duration: 300, delay: 375 }
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
    () => delay(500),
  ]);
};

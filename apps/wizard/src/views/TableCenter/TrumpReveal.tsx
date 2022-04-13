import { Card, splitCard } from "@shared/components/Card";
import { RunDOMEffect, DOMEffect } from "@lib/hooks";
import { WaitFor } from "@lib/state/meter";
import { style } from "@lib/stylus";
import { getNearestDimensions } from "@lib/dom";
import { seq } from "@lib/async/task";
import { randomBetween } from "@lib/random";

const revealEffect: DOMEffect<string> = ($card, suit) => {
  const { width, height } = getNearestDimensions($card.parentElement!);
  const $suit = $card.querySelector("#suit")!;
  const isWild = ["w", "j"].includes(suit);

  return seq([
    () =>
      style($card, {
        x: 0,
        y: 0,
        scale: 1.25,
        opacity: 0,
        rotate: randomBetween(-20, 20),
      }),
    () =>
      style(
        $card,
        { scale: 1, opacity: 1, rotate: randomBetween(-10, 10) },
        { duration: 500, delay: 500 }
      ),
    () =>
      !isWild
        ? style(
            $suit,
            { scale: 1.5, rotate: randomBetween(-24, 24) },
            {
              duration: 500,
              delay: 500,
            }
          )
        : undefined,
    () =>
      !isWild
        ? style(
            $suit,
            { scale: 1, rotate: 0 },
            {
              duration: 500,
              delay: 400,
            }
          )
        : undefined,
    () =>
      style(
        $card,
        { x: width / 2 + 100, y: -height / 2 - 100, rotate: 250 },
        { duration: 500, delay: 850 }
      ),
  ]);
};

export const TrumpReveal = ({
  cardId,
  waitFor,
}: {
  cardId: string;
  waitFor?: WaitFor;
}) => {
  const [, suit] = splitCard(cardId);

  return (
    <RunDOMEffect fn={revealEffect} props={suit} waitFor={waitFor}>
      <div>
        <Card card={cardId} />
      </div>
    </RunDOMEffect>
  );
};

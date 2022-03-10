import { useRef } from "preact/hooks";
import { Card } from "@lib/components/cards";
import { useGameEffect } from "@lib/hooks";
import { WaitFor } from "@lib/state/meter";
import { style } from "@lib/stylus";
import { getNearestDimensions } from "@lib/dom";
import { seq } from "@lib/async";
import { randomBetween } from "@lib/random";
import { splitCard } from "@lib/components/cards";

export const TrumpReveal = ({
  cardId,
  waitFor,
}: {
  cardId: string;
  waitFor?: WaitFor;
}) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const [, suit] = splitCard(cardId);

  const vnode = (
    <div ref={ref}>
      <Card card={cardId} />
    </div>
  );

  useGameEffect(
    ($card) => {
      const { width, height } = getNearestDimensions($card.parentElement!);
      const $suit = $card.querySelector("#suit")!;

      return seq([
        () =>
          style($card, {
            x: 0,
            y: 0,
            scale: 1.5,
            opacity: 0,
            rotate: randomBetween(-45, 45),
          }),
        () =>
          style(
            $card,
            { scale: 1, opacity: 1, rotate: randomBetween(-10, 10) },
            { duration: 500, delay: 500 }
          ),
        () =>
          suit !== "w"
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
          suit !== "w"
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
    },
    ref,
    null,
    waitFor
  );

  return vnode;
};

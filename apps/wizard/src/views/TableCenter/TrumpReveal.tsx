import { useRef } from "preact/hooks";
import { Card } from "@lib/components/cards";
import { useGameEffect } from "@lib/hooks";
import { WaitFor } from "@lib/state/meter";
import { style } from "@lib/stylus";
import { getNearestDimensions } from "@lib/dom";
import { seq } from "@lib/async";
import { randomBetween } from "@lib/random";

export const TrumpReveal = ({
  cardId,
  waitFor,
}: {
  cardId: string;
  waitFor?: WaitFor;
}) => {
  const ref = useRef<HTMLHeadingElement>(null);

  useGameEffect(
    ($el) => {
      const { width, height } = getNearestDimensions($el.parentElement!);
      const $suit = $el.querySelector("#suit")!;
      return seq([
        () =>
          style($el, {
            x: 0,
            y: 0,
            scale: 1.5,
            opacity: 0,
            rotate: randomBetween(-45, 45),
          }),
        () =>
          style(
            $el,
            { scale: 1, opacity: 1, rotate: randomBetween(-10, 10) },
            { duration: 500, delay: 500 }
          ),
        () =>
          style(
            $suit,
            { scale: 1.5, rotate: randomBetween(-24, 24) },
            {
              duration: 500,
              delay: 500,
            }
          ),
        () =>
          style(
            $suit,
            { scale: 1, rotate: 0 },
            {
              duration: 500,
              delay: 400,
            }
          ),
        () =>
          style(
            $el,
            { x: width / 2 + 100, y: -height / 2 - 100, rotate: 250 },
            { duration: 500, delay: 850 }
          ),
      ]);
    },
    ref,
    null,
    waitFor
  );

  return (
    <div ref={ref}>
      <Card card={cardId} />
    </div>
  );
};

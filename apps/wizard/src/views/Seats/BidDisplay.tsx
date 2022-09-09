import { useShallowRef, useDOMEffect, DOMEffect } from "@lib/hooks";
import { style } from "@lib/style";
import { delay, seq } from "@lib/async/task";

import { getScore } from "../../game/logic";
import { useRef } from "preact/hooks";

const scorePopEffect: DOMEffect<{
  bid: number;
  actual: number;
  shouldPop: boolean;
}> = ($el, { bid, actual, shouldPop }) => {
  style($el, {
    textShadow: "",
    opacity: 1,
    transform: "translate(0,0)",
  });
  $el.innerHTML = `${actual}/${bid}`;

  if (shouldPop)
    return seq([
      () => delay(1000),
      () => {
        const score = getScore(bid, actual);
        const color = score > 0 ? "blue" : "red";
        style($el, {
          textShadow: `0 0 7px ${color}, 0 0 10px ${color},
      0 0 21px ${color}`,
        });
        $el.innerHTML = score > 0 ? `+${score}` : `${score}`;

        return style(
          $el,
          {
            scale: [1, 2, 1, 1, 1],
            rotate: [0, -25, 0, 0, 0],
            opacity: [1, 1, 1, 1, 0],
            y: [0, 0, 0, 0, -15],
          },
          { duration: 3500 }
        );
      },
    ]);
};

type BidsDisplayProps = {
  bid: number;
  actual: number;
  shouldPop: boolean;
};

export function BidDisplay({ bid, actual, shouldPop }: BidsDisplayProps) {
  const ref = useRef(null);
  useDOMEffect(scorePopEffect, ref, useShallowRef({ bid, actual, shouldPop }));

  return <div ref={ref} />;
}

import { RunDOMEffect, DOMEffect } from "@lib/hooks";
import { WaitFor } from "@lib/state/meter";
import { style } from "@lib/stylus";
import { delay, seq } from "@lib/async/task";

import { getScore } from "../../game/logic";

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
          [
            {
              transform: "scale(1)",
              opacity: 1,
            },
            {
              transform: "scale(2) rotate(32deg)",
              opacity: 1,
            },
            {
              transform: "scale(2) rotate(32deg)",
              opacity: 1,
            },
            {
              transform: "scale(1)",
              opacity: 1,
            },
            {
              transform: "scale(1)",
              opacity: 1,
            },
            {
              transform: "scale(1)",
              opacity: 1,
            },
            {
              transform: "translateY(-15px)",
              opacity: 0,
            },
          ],
          { duration: 3500 }
        );
      },
    ]);
};

type BidsDisplayProps = {
  bid: number;
  actual: number;
  shouldPop: boolean;
  waitFor: WaitFor;
};

export function BidDisplay({
  bid,
  actual,
  shouldPop,
  waitFor,
}: BidsDisplayProps) {
  return (
    <RunDOMEffect
      fn={scorePopEffect}
      props={{ bid, actual, shouldPop }}
      waitFor={waitFor}
      once={true}
    >
      <div />
    </RunDOMEffect>
  );
}

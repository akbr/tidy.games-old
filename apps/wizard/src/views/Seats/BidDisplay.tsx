import { useLayoutEffect, useRef } from "preact/hooks";
import { useShallowRef } from "@lib/hooks";
import { style } from "@lib/style";
import { delay, seq } from "@lib/async/task";

import { getScore } from "~src/game/logic";
import { waitFor } from "~src/control";

type BidsDisplayProps = {
  bid: number;
  actual: number;
  shouldPop: boolean;
};

const scorePopEffect = (
  $el: HTMLElement,
  { bid, actual, shouldPop }: BidsDisplayProps
) => {
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
            scale: 1,
            rotate: 0,
            opacity: 1,
            y: 0,
          },
          { duration: 3500 }
        );
      },
    ]);
};

export function BidDisplay(props: BidsDisplayProps) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    waitFor(scorePopEffect(ref.current!, props));
  }, [useShallowRef(props)]);

  return <div ref={ref} />;
}

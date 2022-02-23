import { useRef } from "preact/hooks";
import { GameEffect, useGameEffect } from "@lib/hooks";
import { WaitFor } from "@lib/state/meter";
import { style } from "@lib/stylus";

const roundEffect: GameEffect<null> = ($el) => {
  if ($el.textContent === "") return;
  const o0 = { opacity: 0 };
  const o1 = { opacity: 1 };
  return style(
    $el,
    [{ ...o0, scale: 1 }, o1, o1, o1, o1, { ...o0, scale: 1.1 }],
    {
      duration: 2500,
    }
  );
};

type RoundStarProps = {
  num: number;
  waitFor?: WaitFor;
};
export const RoundStart = ({ num, waitFor }: RoundStarProps) => {
  const ref = useRef<HTMLHeadingElement>(null);
  useGameEffect(roundEffect, ref, null, waitFor);

  return (
    <h2 ref={ref} class={`text-white`}>
      Round {num}
    </h2>
  );
};

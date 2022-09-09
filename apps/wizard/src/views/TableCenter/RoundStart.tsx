import { useDOMEffect, DOMEffect } from "@lib/hooks";
import { style } from "@lib/style";
import { useRef } from "preact/hooks";

const roundEffect: DOMEffect<null> = ($el) =>
  style(
    $el,
    {
      scale: [0.75, 1.25],
      opacity: [0, 1, 1, 1, 0],
    },
    {
      duration: 3000,
    }
  );

export const RoundStart = ({ num }: { num: number }) => {
  const ref = useRef(null);
  useDOMEffect(roundEffect, ref, null);
  return (
    <h2 ref={ref} class={`text-white`}>
      Round {num}
    </h2>
  );
};

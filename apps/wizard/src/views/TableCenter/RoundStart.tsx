import { useDOMEffect, DOMEffect } from "@lib/hooks";
import { style } from "@lib/stylus";
import { randomBetween } from "@lib/random";
import { useRef } from "preact/hooks";

const o0 = { opacity: 0 };
const o1 = { opacity: 1 };
const keyframes = () => {
  const dir = randomBetween(-1, 1);
  return [
    { ...o0, scale: 0.9, rotate: randomBetween(-20 * dir, 0) },
    o1,
    o1,
    o1,
    o1,
    { ...o0, scale: 1.1, rotate: randomBetween(0, 20 * dir) },
  ];
};
const roundEffect: DOMEffect<null> = ($el) =>
  style($el, keyframes(), {
    duration: 2500,
  });

export const RoundStart = ({ num }: { num: number }) => {
  const ref = useRef(null);
  useDOMEffect(roundEffect, ref, null);

  return (
    <h2 ref={ref} class={`text-white`}>
      Round {num}
    </h2>
  );
};

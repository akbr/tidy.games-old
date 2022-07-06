import { RunDOMEffect, DOMEffect } from "@lib/hooks";
import { WaitFor } from "@lib/state/meter";
import { style } from "@lib/stylus";
import { randomBetween } from "@lib/random";

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
const roundEffect: DOMEffect<null> = ($el) => {
  return style($el, keyframes(), {
    duration: 2500,
  });
};

type RoundStarProps = {
  num: number;
  waitFor: WaitFor;
};
export const RoundStart = ({ num, waitFor }: RoundStarProps) => {
  return (
    <RunDOMEffect fn={roundEffect} props={null} waitFor={waitFor} once={true}>
      <h2 class={`text-white`}>Round {num}</h2>
    </RunDOMEffect>
  );
};

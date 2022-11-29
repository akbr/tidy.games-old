import { useLayoutEffect, useRef } from "preact/hooks";
import { style } from "@lib/style";
import { waitFor } from "~src/control";
import { randomIntBetween } from "@lib/random";
import { rotateArray } from "@lib/array";

export const RoundStart = ({ num }: { num: number }) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    waitFor(roundEffect(ref.current!));
  }, []);

  return (
    <h2 ref={ref} class={`text-white`}>
      Round {num}
    </h2>
  );
};

const roundEffect = ($el: HTMLElement) =>
  style(
    $el,
    {
      scale: [0.75, 1.5],
      opacity: [0, 1, 1, 1, 0],
      rotate: subtleRotate(4),
    },
    {
      duration: 2750,
    }
  );

const subtleRotate = (by = 10) =>
  rotateArray(
    [randomIntBetween(0, -by), randomIntBetween(0, by)],
    randomIntBetween(0, 1) // randomize direction
  );

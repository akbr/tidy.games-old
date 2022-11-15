import { useLayoutEffect, useRef } from "preact/hooks";
import { style } from "@lib/style";
import { waitFor } from "@src/control";

const roundEffect = ($el: HTMLElement) =>
  style(
    $el,
    [
      { scale: 0, opacity: 0 },
      { scale: 1.5, opacity: 1 },
    ],
    {
      duration: 3000,
    }
  );

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

import { style } from "@lib/style";
import { useLayoutEffect, useRef } from "preact/hooks";
import { receive } from "@lib/globalUi";

const roundEffect = ($el: HTMLElement) =>
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
  useLayoutEffect(() => {
    receive(roundEffect(ref.current!));
  }, []);
  return (
    <h2 ref={ref} class={`text-white`}>
      Round {num}
    </h2>
  );
};

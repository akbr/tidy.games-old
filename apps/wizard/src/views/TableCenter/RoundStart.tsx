import { useRef } from "preact/hooks";
import { useGameEffect } from "@lib/hooks";
import { WaitFor } from "@lib/state/meter";
import { style } from "@lib/stylus";

export const RoundStart = ({
  num,
  waitFor,
}: {
  num: number;
  waitFor?: WaitFor;
}) => {
  const ref = useRef<HTMLHeadingElement>(null);

  useGameEffect(
    ($el) => {
      if ($el.textContent === "") {
        return;
      }
      const o0 = { opacity: 0 };
      const o1 = { opacity: 1 };
      style($el, o0);
      return style(
        $el,
        [{ ...o0, scale: 1 }, o1, o1, o1, o1, { ...o0, scale: 1.1 }],
        {
          duration: 2500,
        }
      );
    },
    ref,
    null,
    waitFor
  );

  return (
    <h2 ref={ref} class={`text-white`}>
      Round {num}
    </h2>
  );
};

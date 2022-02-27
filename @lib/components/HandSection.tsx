import { FunctionComponent, h } from "preact";
import { useRef } from "preact/hooks";

import { style } from "@lib/stylus";
import { useRefreshOnResize, useGameEffect, GameEffect } from "@lib/hooks";
import { getIntraHandPosition } from "@lib/layouts/hand";
import { randomBetween } from "@lib/random";
import { WaitFor } from "@lib/state/meter";

export const applyHandStyles: GameEffect<{
  justDealt: boolean;
}> = ($handContainer: HTMLElement, { justDealt }) => {
  const { width } = $handContainer.getBoundingClientRect();
  const cardEls = Array.from($handContainer.children) as HTMLElement[];
  cardEls.forEach(($card, idx) => {
    const { x, y, zIndex } = getIntraHandPosition(idx, cardEls.length, {
      width,
      height: window.innerHeight,
    });
    if (justDealt) {
      style($card, {
        zIndex,
        left: x,
        top: y + 150,
        rotate: () => randomBetween(-20, 20),
      });
      return style(
        $card,
        { zIndex, left: x, top: y, rotate: 0 },
        { duration: () => randomBetween(300, 500) }
      );
    }
    style($card, { zIndex, left: x, top: y });
  });

  if (justDealt) return 400;
};

export const HandSection: FunctionComponent<{
  justDealt: boolean;
  waitFor?: WaitFor;
}> = ({ justDealt, waitFor, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  useRefreshOnResize();
  useGameEffect(applyHandStyles, ref, { justDealt }, waitFor);
  return (
    <section id="hand" class="relative" ref={ref}>
      {children}
    </section>
  );
};

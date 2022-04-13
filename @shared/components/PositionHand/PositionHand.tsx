import { ComponentChildren } from "preact";

import { style } from "@lib/stylus";
import { useRefreshOnResize, RunDOMEffect, DOMEffect } from "@lib/hooks";
import { randomBetween } from "@lib/random";
import { WaitFor } from "@lib/state/meter";
import { all } from "@lib/async/task";

import { getIntraHandPosition } from "./handLayout";

export const PositionHand = ({
  justDealt,
  waitFor,
  children,
}: {
  justDealt: boolean;
  waitFor?: WaitFor;
  children: ComponentChildren;
}) => {
  useRefreshOnResize();

  return (
    <RunDOMEffect fn={applyHandStyles} props={{ justDealt }} waitFor={waitFor}>
      <section id="hand" class="relative cursor-pointer">
        {children}
      </section>
    </RunDOMEffect>
  );
};
export default PositionHand;

export const applyHandStyles: DOMEffect<{
  justDealt: boolean;
}> = ($handContainer: HTMLElement, { justDealt }) => {
  const { width } = $handContainer.getBoundingClientRect();
  const cardEls = Array.from($handContainer.children) as HTMLElement[];

  const anims = cardEls.map(($card, idx) => {
    const { x, y, zIndex } = getIntraHandPosition(idx, cardEls.length, {
      width,
      height: window.innerHeight,
    });
    if (justDealt) {
      style($card, {
        zIndex,
        left: x,
        top: y + 150,
        rotate: randomBetween(-20, 20),
      });
      return style(
        $card,
        { zIndex, left: x, top: y, rotate: 0 },
        { duration: 400, delay: idx * 100 }
      );
    }
    style($card, { zIndex, left: x, top: y });
  });

  return all(anims);
};

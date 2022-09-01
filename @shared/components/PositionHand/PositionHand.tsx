import { ComponentChildren } from "preact";
import { useRef } from "preact/hooks";

import { style } from "@lib/stylus";
import { useRefreshOnResize, useDOMEffect, DOMEffect } from "@lib/hooks";

import { getIntraHandPosition } from "./handLayout";

export const PositionHand = ({
  children,
  childWidth = 80,
  xPeek = 35,
  yPeek = 60,
}: {
  children: ComponentChildren;
  xPeek?: number;
  yPeek?: number;
  childWidth?: number;
}) => {
  const ref = useRef(null);
  useRefreshOnResize();
  useDOMEffect(applyHandStyles, ref, { xPeek, yPeek, childWidth });

  return (
    <section id="hand" class="relative cursor-pointer" ref={ref}>
      {children}
    </section>
  );
};
export default PositionHand;

export const applyHandStyles: DOMEffect<{
  childWidth: number;
  xPeek: number;
  yPeek: number;
}> = ($handContainer: HTMLElement, { xPeek, yPeek, childWidth }) => {
  const { width } = $handContainer.getBoundingClientRect();
  const cardEls = Array.from($handContainer.children) as HTMLElement[];

  cardEls.forEach(($card, idx) => {
    const { x, y, zIndex } = getIntraHandPosition(
      idx,
      cardEls.length,
      {
        width,
        height: window.innerHeight,
      },
      childWidth,
      xPeek,
      yPeek
    );

    style($card, { zIndex, left: x, top: y });
  });
};

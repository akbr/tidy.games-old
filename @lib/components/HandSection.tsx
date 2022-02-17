import { FunctionComponent, h } from "preact";
import { useRef } from "preact/hooks";

import { style } from "@lib/stylus";
import { useRefreshOnResize, useGameEffect } from "@lib/hooks";
import { getIntraHandPosition } from "@lib/layouts/hand";

export const applyHandStyles = ($handContainer: HTMLElement) => {
  const { width } = $handContainer.getBoundingClientRect();
  const cardEls = Array.from($handContainer.children) as HTMLElement[];
  cardEls.forEach(($card, idx) => {
    const { x, y, zIndex } = getIntraHandPosition(idx, cardEls.length, {
      width,
      height: window.innerHeight,
    });
    style($card, { zIndex, left: x, top: y });
  });
};

export const HandSection: FunctionComponent = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);

  useRefreshOnResize();
  useGameEffect(applyHandStyles, ref, null);

  return (
    <section id="hand" class="relative" ref={ref}>
      {children}
    </section>
  );
};

import { FunctionComponent, h } from "preact";
import { useLayoutEffect, useRef } from "preact/hooks";

import { style } from "@lib/stylus";
import { useRefreshOnResize } from "@lib/hooks";
import { getIntraHandPosition } from "@lib/layouts/hand";

export const applyHandStyles = ($handContainer: HTMLElement) => {
  const { width } = $handContainer.getBoundingClientRect();
  const cardEls = Array.from($handContainer.children) as HTMLElement[];
  cardEls.forEach(($card, idx) => {
    const { x, y, zIndex } = getIntraHandPosition(idx, cardEls.length, {
      width,
      height: window.innerHeight,
    });
    style($card, { zIndex, left: x, top: y }, { duration: 200 });
  });
};

export const HandSection: FunctionComponent = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);

  useRefreshOnResize();
  useLayoutEffect(() => applyHandStyles(ref.current!));

  return (
    <section id="hand" ref={ref}>
      {children}
    </section>
  );
};

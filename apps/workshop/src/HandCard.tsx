import { h } from "preact";
import { useLayoutEffect, useRef, useState } from "preact/hooks";

import { style } from "@lib/stylus";
import { dragify } from "@lib/dom/dragify";
import { Card } from "@lib/components/cards";
import { getPlayedPosition } from "@lib/layouts/trick";
import { getNearestDimensions } from "@lib/dom";

const initCardEvents = (
  $el: HTMLElement,
  setPlayed: (cardId: string) => void
) =>
  dragify($el, {
    onStart: ($el) => {},
    onDrag: ($el, x, y) => {
      style($el, { x, y });
    },
    onEnd: ($el, x, y) => {
      const played = y < -50;
      if (played) {
        setPlayed($el.dataset.card!);
      } else {
        style($el, { x: 0, y: 0 }, { duration: 200 });
      }
    },
  });

const applyPlayAnimation = ($card: HTMLElement) => {
  const rect = getNearestDimensions($card);
  const { x, y } = getPlayedPosition(4, 0, rect);
  return style($card, { x: 0, y: 0, left: x, top: y }, { duration: 200 });
};

type HandCardProps = { card: string; play: (cardId: string) => void };
export const HandCard = ({ card, play }: HandCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [playAttempt, setPlayAttempt] = useState<string | null>(null);

  useLayoutEffect(() => {
    playAttempt &&
      applyPlayAnimation(ref.current!)?.finished.then(() => {
        setPlayAttempt(null);
        play(playAttempt);
      });
  });

  useLayoutEffect(() => {
    return initCardEvents(ref.current!, setPlayAttempt);
  }, [ref]);

  return (
    <div ref={ref} data-card={card} class="absolute">
      <Card card={card} />
    </div>
  );
};

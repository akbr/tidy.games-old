import { useLayoutEffect, useRef, useState } from "preact/hooks";

import { style } from "@lib/stylus";
import { dragify } from "@lib/dom/dragify";
import { Card } from "@shared/components/Card";
import { getPlayedPosition } from "@shared/components/PositionTrick/trickLayout";
import { getNearestDimensions } from "@lib/dom";

import { PositionHand } from "@shared/components/PositionHand";

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

type HandCardProps = {
  card: string;
  play: (cardId: string) => void;
  err?: any;
};
export const HandCard = ({ card, play }: HandCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [playAttempt, setPlayAttempt] = useState<string | null>(null);

  useLayoutEffect(() => initCardEvents(ref.current!, setPlayAttempt), [ref]);

  useLayoutEffect(() => {
    if (playAttempt) {
      applyPlayAnimation(ref.current!)?.finished.then(() => {
        setPlayAttempt(null);
        play(playAttempt);
      });
    }
  }, [playAttempt]);

  return (
    <div ref={ref} data-card={card} class="absolute">
      <Card key={"hand" + card} card={card} />
    </div>
  );
};

export const Hand = ({
  hand,
  play,
}: {
  hand: string[];
  play: (card: string) => void;
}) => {
  return (
    <PositionHand>
      {hand.map((id) => (
        <HandCard key={id} card={id} play={(s) => play(s)} />
      ))}
    </PositionHand>
  );
};

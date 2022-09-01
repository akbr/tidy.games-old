import { useLayoutEffect, useRef, useState } from "preact/hooks";

import { DOMEffect, useDOMEffect } from "@lib/hooks";
import { dragify } from "@lib/dom/dragify";
import { style } from "@lib/stylus";
import { getNearestDimensions } from "@lib/dom";

import { getCenterPlayedPosition } from "@shared/components/PositionTrick/trickLayout";
import { PositionHand } from "@shared/components/PositionHand";

import { Cards, cardGlyphs } from "../game/glossary";
import { xPeek, yPeek } from "./uiVars";
import { Card } from "./Card";

const initCardDrag: DOMEffect<(cardId: Cards) => void> = (
  $el,
  setPlayAttempt
) => {
  dragify($el, {
    onStart: ($el) => {},
    onDrag: ($el, x, y) => {
      style($el, { x, y });
    },
    onEnd: ($el, x, y) => {
      const played = y < -50;
      if (played) {
        const card = $el.dataset.card!;
        const parsed = parseInt(card);
        const submission = isNaN(parsed) ? card : (parsed as any);
        setPlayAttempt(submission);
      } else {
        style($el, { x: 0, y: 0 }, { duration: 200 });
      }
    },
  });
};

const applyPlayAnimation = ($card: HTMLElement) => {
  const rect = getNearestDimensions($card);
  const { x, y } = getCenterPlayedPosition(rect);
  return style($card, { x: 0, y: 0, left: x, top: y }, { duration: 200 });
};

function HandCard({
  card,
  play,
}: {
  card: Cards;
  play: (card: Cards | false) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [playAttempt, setPlayAttempt] = useState<Cards | null>(null);

  useLayoutEffect(() => {
    if (playAttempt) {
      applyPlayAnimation(ref.current!)?.finished.then(() => {
        setPlayAttempt(playAttempt);
        play(playAttempt);
        setPlayAttempt(null);
      });
    }
  }, [playAttempt]);

  useDOMEffect(initCardDrag, ref, setPlayAttempt);

  return (
    <div ref={ref} class="absolute" data-card={card}>
      <Card glyph={cardGlyphs[card]} />
    </div>
  );
}

export function Hand({
  cards,
  play,
}: {
  cards: Cards[];
  play: (card: Cards | false) => void;
}) {
  return (
    <PositionHand xPeek={xPeek} yPeek={yPeek}>
      {cards.map((card) => (
        <HandCard card={card} play={play} />
      ))}
    </PositionHand>
  );
}
export default Hand;

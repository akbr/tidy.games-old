import { useLayoutEffect, useRef, useState } from "preact/hooks";

import { DOMEffect, RunDOMEffect } from "@lib/hooks";
import { dragify } from "@lib/dom/dragify";
import { style } from "@lib/stylus";
import { getNearestDimensions } from "@lib/dom";

import { getCenterPlayedPosition } from "@shared/components/PositionTrick/trickLayout";
import { PositionHand } from "@shared/components/PositionHand";

import { Cards, cardGlyphs } from "../game/glossary";
import { xPeek, yPeek } from "./uiVars";
import { Card } from "./Card";

const initCardDrag: DOMEffect<{
  setPlayAttempt: (cardId: string | number) => void;
}> = ($el, { setPlayAttempt }) => {
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
        setPlayAttempt(isNaN(parsed) ? card : parsed);
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

type PlayAttempt = string | number | null;

function HandCard({
  card,
  err,
  play,
}: {
  card: Cards;
  play: (card: string | number) => void;
  err?: { type: string; data: string };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [playAttempt, setPlayAttempt] = useState<PlayAttempt>(null);

  useLayoutEffect(() => {
    if (playAttempt) {
      applyPlayAnimation(ref.current!)?.finished.then(() => {
        setPlayAttempt(null);
        play(playAttempt);
      });
    }

    if (err) {
      style(ref.current!, { x: 0, y: 0 });
    }
  }, [err, playAttempt]);

  return (
    <RunDOMEffect fn={initCardDrag} props={{ setPlayAttempt }}>
      <div class="absolute" data-card={card} ref={ref}>
        <Card glyph={cardGlyphs[card]} />
      </div>
    </RunDOMEffect>
  );
}

export function Hand({
  cards,
  play,
  err,
}: {
  cards: Cards[];
  play: (card: string | number) => void;
  err?: { type: string; data: string };
}) {
  return (
    <PositionHand justDealt={false} xPeek={xPeek} yPeek={yPeek}>
      {cards.map((card) => (
        <HandCard card={card} play={play} err={err} />
      ))}
    </PositionHand>
  );
}
export default Hand;

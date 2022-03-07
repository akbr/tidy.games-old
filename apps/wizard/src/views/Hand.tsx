import { useLayoutEffect, useRef, useState } from "preact/hooks";

import { style } from "@lib/stylus";
import { dragify } from "@lib/dom/dragify";
import { Card } from "@lib/components/cards";
import { getPlayedPosition } from "@lib/layouts/trick";
import { getNearestDimensions } from "@lib/dom";

import { HandSection } from "@lib/components/HandSection";
import { GameProps } from "./types";

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
export const HandCard = ({ card, play, err }: HandCardProps) => {
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

    if (err) {
      style(ref.current!, { x: 0, y: 0 });
    }
  });

  return (
    <div ref={ref} data-card={card} class="absolute">
      <Card key={"hand" + card} card={card} />
    </div>
  );
};

export const Hand = ({ frame, controls, err }: GameProps) => {
  const {
    state: [type, game],
  } = frame;
  const hand = game.hands[0];
  return (
    <HandSection justDealt={type === "deal"} waitFor={controls.meter.waitFor}>
      {hand.map((id) => (
        <HandCard
          key={id}
          err={err}
          card={id}
          play={(s) => controls.game.play(s)}
        />
      ))}
    </HandSection>
  );
};

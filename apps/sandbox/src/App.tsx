import { useState } from "preact/hooks";

import { style } from "@lib/style";
import { getNearestDimensions } from "@lib/dom";

import { Card } from "@shared/components/Card";
import { getPlayedPosition } from "@shared/domEffects/positionTrick";
import {
  PositionHandCard,
  PositionHandCardProps,
} from "@shared/components/PositionHandCard";

const cards = [
  "2|s",
  "3|s",
  "4|s",
  "5|s",
  "6|s",
  "7|s",
  "8|s",
  "9|s",
  "10|s",
  "11|s",
  "12|s",
  "13|s",
  "14|s",
  "2|h",
  "3|h",
  "4|h",
  "5|h",
  "6|h",
  "7|h",
  "8|h",
  "9|h",
];

export function App() {
  const [err, set] = useState<any>(null);

  return (
    <div class="w-full h-full bg-slate-700 text-white">
      <div class="absolute top-0 right-0">
        <button onClick={() => set({})}>error</button>
      </div>
      <Hand cards={cards} resetRef={err} />
    </div>
  );
}

function shouldDrop(mx: number, my: number) {
  return my < -50;
}

const onDrop: PositionHandCardProps["onDrop"] = ($el, card) => {
  const [width, height] = getNearestDimensions($el);
  const { x, y } = getPlayedPosition(2, 0, {
    width,
    height,
  });
  style($el, { x, y }, { duration: 250 })?.finished.then(() => {
    console.log("playing", card);
  });
};

export function Hand({ cards, resetRef }: { cards: string[]; resetRef: any }) {
  return (
    <>
      {cards.map((id, idx) => (
        <PositionHandCard
          key={id}
          idx={idx}
          numCards={cards.length}
          card={id}
          errRef={resetRef}
          shouldDrop={shouldDrop}
          onDrop={onDrop}
        >
          <Card key={id} card={id} />
        </PositionHandCard>
      ))}
    </>
  );
}

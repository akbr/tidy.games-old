import { ComponentChildren } from "preact";
import { useState, useRef, useLayoutEffect } from "preact/hooks";
import { useDrag } from "@use-gesture/react";

import { style } from "@lib/style";

import { Card } from "@shared/components/Card";
import { getHandCardPosition } from "@shared/domEffects/positionHand";
import { getPlayedPosition } from "@shared/domEffects/positionTrick";

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

export function Hand({ cards, resetRef }: { cards: string[]; resetRef: any }) {
  return (
    <>
      {cards.map((id, idx) => (
        <PositionHandCard idx={idx} numCards={cards.length}>
          <DragComponent data={id} key={id} cancelRef={resetRef}>
            <Card card={id} />
          </DragComponent>
        </PositionHandCard>
      ))}
    </>
  );
}

function PositionHandCard({
  idx,
  numCards,
  children,
}: {
  idx: number;
  numCards: number;
  children: ComponentChildren;
}) {
  let [x, y, zIndex] = getHandCardPosition(idx, numCards);

  return (
    <div
      style={{
        position: "absolute",
        transform: `translate(${x}px, ${y}px`,
        transition: "transform 300ms",
        zIndex,
        cursor: "pointer",
      }}
    >
      {children}
    </div>
  );
}

function shouldDrop(mx: number, my: number) {
  return my < -50;
}

function onDrop(id: string, $el: HTMLElement, [mx, my]: number[]) {
  const r = $el.getBoundingClientRect();
  const { x, y } = getPlayedPosition(2, 0, {
    width: window.innerWidth,
    height: window.innerHeight - 100,
  });
  const tx = x;
  const ty = y;
  style(
    $el,
    {
      x: mx - r.x + tx,
      y: my - r.y + ty,
    },
    { duration: 250 }
  );
}

function DragComponent({
  children,
  data,
  cancelRef,
}: {
  children: ComponentChildren;
  data: string;
  cancelRef?: any;
}) {
  const [state, setState] = useState<"free" | "playing">("free");
  const ref = useRef(null);
  const bind = useDrag(
    ({ down, movement: [mx, my], target, cancel }) => {
      const $el: HTMLElement = ref.current!;

      if (down) {
        style($el, { x: mx, y: my });
      }

      if (!down) {
        const dropped = shouldDrop ? shouldDrop(mx, my) : false;
        if (onDrop && dropped) {
          onDrop(data, $el, [mx, my]);
          cancel();
          setState("playing");
        } else {
          style($el, { x: 0, y: 0, rotate: 0 }, { duration: 250 });
        }
      }
    },
    { enabled: state === "free" }
  );

  useLayoutEffect(() => {
    if (cancelRef && state === "playing") {
      style(
        ref.current!,
        { x: 0, y: 0, rotate: 0 },
        { duration: 250 }
      ).finished.then(() => setState("free"));
    }
  }, [cancelRef]);

  return (
    <div
      ref={ref}
      class="absolute"
      style={{
        touchAction: "none",
      }}
      {...bind()}
    >
      {children}
    </div>
  );
}

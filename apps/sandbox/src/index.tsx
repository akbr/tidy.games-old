import "@shared/base.css";
import { ComponentChildren, render } from "preact";
import { Card } from "@shared/components/Card";
import { positionHand } from "@shared/domEffects/positionHand";
import { getPlayedPosition } from "@shared/domEffects/positionTrick";
import { dragify } from "@lib/dom/dragify";
import { useLayoutEffect, useRef } from "preact/hooks";
import style, { skipTasks } from "@lib/stylus";
import { getNearestDimensions } from "@lib/dom";
import { receive } from "@lib/globalUi";
import { useRefreshOnResize } from "@lib/hooks";

function App({ children }: { children: ComponentChildren }) {
  return <div class="w-full h-full bg-purple-400">{children}</div>;
}

const initHandDrags = ($container: HTMLElement) =>
  dragify($container, {
    selectEl: ($target) => $target.closest("[data-card]")!,
    onBeforeStart: ($card) => skipTasks($card),
    onDrag: ($card, { startX, startY, dX, dY }) => {
      style($card, { x: startX + dX, y: startY + dY });
    },
    onEnd: ($card, { startX, startY, dY }) => {
      const played = dY < -50;
      if (played) {
        style($card, getPlayedPosition(1, 0, getNearestDimensions($card)), {
          duration: 250,
        });
      } else {
        receive(style($card, { x: startX, y: startY }, { duration: 250 })!);
      }
    },
  });

function Hand({ cards }: { cards: string[] }) {
  const onResize = useRefreshOnResize();
  const ref = useRef(null)!;
  const vnode = (
    <section id="hand" class="relative cursor-pointer" ref={ref}>
      {cards.map((card) => (
        <div class="absolute" data-card={card}>
          <Card card={card} />
        </div>
      ))}
    </section>
  );

  useLayoutEffect(() => {
    receive(positionHand(ref.current!, { deal: true }));
  }, [cards, onResize]);

  useLayoutEffect(() => initHandDrags(ref.current!), []);

  return vnode;
}

render(
  <App>
    <Hand cards={["2|h", "3|h", "4|h", "5|h", "7|h"]} />
  </App>,
  document.body
);

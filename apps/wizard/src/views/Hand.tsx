import { useLayoutEffect, useRef } from "preact/hooks";

import { skipTasks, style } from "@lib/stylus";
import { dragify } from "@lib/dom/dragify";
import { Card } from "@shared/components/Card";
import { getNearestDimensions } from "@lib/dom";
import { useRefreshOnResize } from "@lib/hooks";
import { receive } from "@lib/globalUi";

import { positionHand } from "@shared/domEffects/positionHand";
import { getPlayedPosition } from "@shared/domEffects/positionTrick";

export const Hand = ({
  hand,
  play,
  err,
  deal,
}: {
  hand: string[];
  play: (card: string) => boolean;
  err: null | Object;
  deal: boolean;
}) => {
  const onResize = useRefreshOnResize();
  const ref = useRef(null)!;
  const vnode = (
    <section id="hand" class="relative cursor-pointer" ref={ref}>
      {hand.map((card) => (
        <div class="absolute" data-card={card} key={card}>
          <Card card={card} />
        </div>
      ))}
    </section>
  );

  useLayoutEffect(() => {
    receive(positionHand(ref.current!, { deal }));
  }, [hand, onResize, err]);

  useLayoutEffect(() => initHandDrags(ref.current!, play), []);

  return vnode;
};

function initHandDrags(
  $container: HTMLElement,
  play: (card: string) => boolean
) {
  return dragify($container, {
    selectEl: ($target) => $target.closest("[data-card]")!,
    onBeforeStart: ($card) => skipTasks($card),
    onDrag: ($card, { startX, startY, dX, dY }) => {
      style($card, { x: startX + dX, y: startY + dY });
    },
    onEnd: ($card, { startX, startY, dY }) => {
      const played = dY < -50;
      if (played) {
        const playSent = play($card.dataset.card!);
        if (playSent) {
          receive(
            style($card, getPlayedPosition(1, 0, getNearestDimensions($card)), {
              duration: 250,
            })
          );
        }
        return;
      }

      style($card, { x: startX, y: startY }, { duration: 250 });
    },
  });
}

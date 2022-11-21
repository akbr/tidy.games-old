import { style } from "@lib/style";
import { getNearestDimensions } from "@lib/dom";

import { Card } from "@shared/components/Card";
import { getPlayedPosition } from "@shared/domEffects/positionTrick";

import {
  PositionHandCard,
  PositionHandCardProps,
} from "@shared/components/PositionHandCard";

import { useGame, gameActions } from "@src/control";
import { getHandHeight } from "@shared/domEffects/positionHand";

const shouldDrop: PositionHandCardProps["shouldDrop"] = (_, dy) => dy < -50;

const onDrop: PositionHandCardProps["onDrop"] = ($el, card, numCards) => {
  const [containerWidth, containerHeight] = getNearestDimensions($el);
  const handHeight = getHandHeight(numCards, containerWidth);
  const { x, y } = getPlayedPosition(2, 0, {
    width: containerWidth,
    height: containerHeight - handHeight,
  });
  style($el, { x, y }, { duration: 250 })?.finished.then(() => {
    gameActions.play(card);
  });
};

export function Hand() {
  const [hand, err] = useGame((x) => [x.board.hands[x.playerIndex], x.err]);

  return (
    <section id="hand" class="absolute top-0 left-0">
      {hand.map((id, idx) => (
        <PositionHandCard
          key={id}
          idx={idx}
          card={id}
          numCards={hand.length}
          shouldDrop={shouldDrop}
          onDrop={onDrop}
          errRef={err}
        >
          <Card key={id} card={id} />
        </PositionHandCard>
      ))}
    </section>
  );
}

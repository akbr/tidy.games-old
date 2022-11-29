import { style } from "@lib/style";
import { getNearestDimensions } from "@lib/dom";

import { Card } from "@shared/components/Card";
import { getPlayedPosition } from "@shared/domEffects/positionTrick";

import {
  PositionHandCard,
  PositionHandCardProps,
} from "@shared/components/PositionHandCard";
import { getHandHeight } from "@shared/domEffects/positionHand";

import control from "~src/control";

const {
  useGame,
  createGameSelector,
  gameActions: { play },
  waitFor,
} = control;

const shouldDrop: PositionHandCardProps["shouldDrop"] = (_, dy) => dy < -50;

const onDrop: PositionHandCardProps["onDrop"] = ($el, card, numCards) => {
  const [containerWidth, containerHeight] = getNearestDimensions($el);
  const handHeight = getHandHeight(numCards, containerWidth);
  const { x, y } = getPlayedPosition(2, 0, {
    width: containerWidth,
    height: containerHeight - handHeight,
  });
  style($el, { x, y }, { duration: 250 })?.finished.then(() => {
    play(card);
  });
};

const handSelector = createGameSelector(
  ({ board: { phase, hands }, playerIndex, err }) => {
    return {
      hand: hands[playerIndex],
      isDealt: phase === "deal",
      err,
    };
  }
);

export function Hand() {
  const { hand, isDealt, err } = useGame(handSelector);

  return (
    <section id="hand" class="absolute top-0 left-0">
      {hand.map((id, idx) => (
        <PositionHandCard
          key={id}
          idx={idx}
          card={id}
          isDeal={isDealt}
          waitFor={waitFor}
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

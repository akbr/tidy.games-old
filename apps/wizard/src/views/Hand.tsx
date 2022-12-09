import { style } from "@lib/style";
import { getNearestDimensions } from "@lib/dom";

import { Card } from "@shared/components/Card";
import {
  getPlayedPosition,
  getTrickScaling,
} from "@shared/domEffects/positionTrick";

import {
  PositionHandCard,
  PositionHandCardProps,
} from "@shared/components/PositionHandCard";

import control, {
  getDimensions,
  getTableDimensions,
  useDimensions,
} from "~src/control";
import { PLAY_DISTANCE } from "./Trick";
import { BADGE_PADDING } from "./uiConsts";

import { client } from "~src/control";

const {
  useGame,
  createGameSelector,
  gameActions: { play },
  waitFor,
} = control;

const shouldDrop: PositionHandCardProps["shouldDrop"] = (_, dy) => dy < -50;

const onDrop: PositionHandCardProps["onDrop"] = ($el, card, numCards) => {
  const dimensions = getTableDimensions();

  //@ts-ignore
  const numPlayers = client.emitter.get().ctx.numPlayers;

  const containerDimensions = [dimensions.width, dimensions.height];
  const { scale, scaledDimensions, playDistance } = getTrickScaling(
    numPlayers,
    containerDimensions,
    $el,
    PLAY_DISTANCE
  );

  const [x, y] = getPlayedPosition(
    2,
    0,
    containerDimensions,
    scaledDimensions,
    playDistance,
    scale
  );

  style(
    $el,
    {
      x: x + dimensions.x,
      y: y + dimensions.y,
      scale,
    },
    { duration: 250 }
  )?.finished.then(() => {
    play(card);
  });
};

const handSelector = createGameSelector(
  ({ board: { phase, hands }, playerIndex, err }) => {
    return {
      hand: hands[playerIndex],
      isDeal: phase === "deal",
      err,
    };
  }
);

export function Hand() {
  const { hand, isDeal, err } = useGame(handSelector);

  return (
    <section id="hand" class="absolute top-0 left-0">
      {hand.map((id, idx) => (
        <PositionHandCard
          key={id}
          idx={idx}
          card={id}
          isDeal={isDeal}
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

import { style } from "@lib/style";
import { Card } from "@shared/components/Card";
import {
  getPlayedPosition,
  getTrickScaling,
} from "@shared/domEffects/positionTrick";

import {
  PositionHandCard,
  PositionHandCardProps,
} from "@shared/components/PositionHandCard";

import { PLAY_DISTANCE } from "./Trick";
import { getTableDimensions } from "./tableDimensions";

import { bundle, ClientGame } from "~src/bundle";
const {
  client: {
    useGame,

    emitter,
    waitFor,
    gameActions: { play },
  },
  view: { useGameDimensions },
} = bundle;

const shouldDrop: PositionHandCardProps["shouldDrop"] = (_, dy) => dy < -50;

const onDrop: PositionHandCardProps["onDrop"] = ($el, card, numCards) => {
  const dimensions = getTableDimensions();

  //@ts-ignore
  const numPlayers = emitter.get().ctx.numPlayers;

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

const handSelector = ({
  board: { phase, hands },
  playerIndex,
  err,
}: ClientGame) => {
  return {
    hand: hands[playerIndex],
    isDeal: phase === "deal",
    err,
  };
};
export function Hand() {
  const { hand, isDeal, err } = useGame(handSelector);
  const { width, height, resizeSymbol } = useGameDimensions();

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
          containerDimensions={[width, height]}
          resizeSymbol={resizeSymbol}
          cardWidth={80}
        >
          <Card key={id} card={id} />
        </PositionHandCard>
      ))}
    </section>
  );
}

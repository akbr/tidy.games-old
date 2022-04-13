import { GameProps } from "./types";

import { PositionTrick } from "@shared/components/PositionTrick";
import { Card } from "@shared/components/Card";

export const Trick = ({ frame, controls }: GameProps) => {
  const [phase, game] = frame.state;
  const { trickLeader, trick } = game;

  const {
    action,
    ctx: { numPlayers },
    player,
  } = frame;

  const effect = (() => {
    if (phase === "played") {
      return {
        type: "played",
        player: action!.player,
      } as const;
    }

    if (phase === "trickWon") {
      return {
        type: "won",
        player: game.trickWinner,
      } as const;
    }
  })();

  return (
    <PositionTrick
      numPlayers={numPlayers}
      leadPlayer={trickLeader}
      perspective={player}
      effect={effect}
      waitFor={controls.meter.waitFor}
    >
      {trick.map((cardId) => (
        <div key={cardId} class="absolute">
          <Card key={"trick-" + cardId} card={cardId} />
        </div>
      ))}
    </PositionTrick>
  );
};

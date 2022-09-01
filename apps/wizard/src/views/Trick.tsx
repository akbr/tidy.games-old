import { PositionTrick } from "@shared/components/PositionTrick";
import { Card } from "@shared/components/Card";
import { GameProps } from "@lib/tabletop";
import { WizardSpec } from "src/game/spec";

export const Trick = ({ state, room, ctx }: GameProps<WizardSpec>) => {
  const { phase, trickLeader, trickWinner, trick } = state;

  const effect = (() => {
    if (phase === "played") {
      return {
        type: "played",
        player: state.player!,
      } as const;
    }

    if (phase === "trickWon") {
      return {
        type: "won",
        player: trickWinner!,
      } as const;
    }
  })();

  return (
    <PositionTrick
      numPlayers={ctx.numPlayers}
      leadPlayer={trickLeader}
      perspective={room.player}
      effect={effect}
    >
      {trick.map((cardId) => (
        <div key={cardId} class="absolute">
          <Card key={"trick-" + cardId} card={cardId} />
        </div>
      ))}
    </PositionTrick>
  );
};

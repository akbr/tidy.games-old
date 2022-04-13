import { GameProps } from "./types";
import { TrickSection } from "@lib/components/TrickSection";
import { Card } from "@lib/components/cards/";

export const Trick = ({ frame, controls }: GameProps) => {
  const [phase, game] = frame.state;

  const {
    action,
    ctx: { numPlayers },
    player,
  } = frame;

  const { trickLeader, trick } = game;

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
    <TrickSection
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
    </TrickSection>
  );
};

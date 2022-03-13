import { GameProps } from "./types";
import { TrickSection, TrickProps } from "@lib/components/TrickSection";
import { Card } from "@lib/components/cards/";
import { FunctionComponent } from "preact";

const TrickCard: FunctionComponent<{ cardId: string }> = ({ cardId }) => (
  <div key={cardId} class="absolute">
    <Card key={"trick" + cardId} card={cardId} />
  </div>
);

export const Trick: FunctionComponent<GameProps> = ({ frame, controls }) => {
  const {
    state: [type, game],
    action,
    ctx,
    player,
  } = frame;

  const numPlayers = ctx.numPlayers;
  const leadPlayer = game.trickLeader;
  const trick = game.trick;

  const effect: TrickProps["effect"] = (() => {
    //These two effects overlap without separate action framtes!

    if (action && action.type === "play") {
      return {
        type: "played",
        player: action.player,
      };
    }

    if (type === "trickWon") {
      return {
        type: "won",
        player: game.trickWinner as number,
      };
    }
  })();

  return (
    <TrickSection
      numPlayers={numPlayers}
      leadPlayer={leadPlayer}
      perspective={player}
      effect={effect}
      waitFor={controls.meter.waitFor}
    >
      {trick.map((cardId) => (
        <TrickCard cardId={cardId} />
      ))}
    </TrickSection>
  );
};

import { ViewProps } from "./types";
import { TrickSection, TrickProps } from "@lib/components/TrickSection";
import { Card } from "@lib/components/cards/";
import { FunctionComponent } from "preact";

const TrickCard: FunctionComponent<{ cardId: string }> = ({ cardId }) => (
  <div key={cardId} class="absolute">
    <Card key={"trick" + cardId} card={cardId} />
  </div>
);

export const Trick: FunctionComponent<ViewProps> = ({
  state,
  waitFor,
  ctx,
  action,
  room,
}) => {
  const [type, game] = state;

  const numPlayers = ctx.numPlayers;
  const leadPlayer = game.trickLeader;
  const perspective = room.player;
  const trick = game.trick;

  const effect: TrickProps["effect"] =
    action && action.type === "play"
      ? {
          type: "played",
          player: action.player,
        }
      : !action && type === "trickWon"
      ? {
          type: "won",
          player: game.trickWinner as number,
        }
      : { type: "none" };
  return (
    <TrickSection
      numPlayers={numPlayers}
      leadPlayer={leadPlayer}
      perspective={perspective}
      effect={effect}
      waitFor={waitFor}
    >
      {trick.map((cardId) => (
        <TrickCard cardId={cardId} />
      ))}
    </TrickSection>
  );
};
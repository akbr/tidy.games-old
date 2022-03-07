import { FunctionComponent } from "preact";
import { GameProps } from "../types";
import { RoundStart } from "./RoundStart";
import { TrumpReveal } from "./TrumpReveal";
import { BidInput } from "./BidInput";

const Center: FunctionComponent = ({ children }) => (
  <div class="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">
    {children}
  </div>
);

export const TableCenter = ({ frame, controls }: GameProps) => {
  const {
    state: [type, game],
    ctx,
  } = frame;

  const next =
    type === "roundStart" ? (
      <RoundStart num={game.round} waitFor={controls.meter.waitFor} />
    ) : type === "deal" && game.trumpCard ? (
      <TrumpReveal cardId={game.trumpCard} waitFor={controls.meter.waitFor} />
    ) : type === "bid" ? (
      frame.player !== game.player || frame.action ? (
        <div>Waiting for bids...</div>
      ) : (
        <BidInput
          turn={game.round}
          bids={game.bids}
          submit={controls.game.bid}
          numPlayers={ctx.numPlayers}
        />
      )
    ) : type === "bidsEnd" && !frame.action ? (
      <div>TK over/underbid</div>
    ) : type === "tallyScores" ? (
      <div>TK Tally scores</div>
    ) : null;

  return <Center>{next}</Center>;
};

import { FunctionComponent } from "preact";
import { GameProps } from "../types";
import { RoundStart } from "./RoundStart";
import { TrumpReveal } from "./TrumpReveal";

const Center: FunctionComponent = ({ children }) => (
  <div class="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">
    {children}
  </div>
);

export const TableCenter = ({ frame, controls }: GameProps) => {
  const {
    state: [type, game],
  } = frame;

  const next =
    type === "roundStart" ? (
      <RoundStart num={game.round} waitFor={controls.waitFor} />
    ) : type === "deal" && game.trumpCard ? (
      <TrumpReveal cardId={game.trumpCard} waitFor={controls.waitFor} />
    ) : type === "bid" ? (
      frame.player !== game.player ? (
        <div>Waiting for bids...</div>
      ) : (
        <div>TK Your turn to bid!!!</div>
      )
    ) : type === "bidsEnd" && !frame.action ? (
      <div>TK over/underbid</div>
    ) : type === "tallyScores" ? (
      <div>TK Tally scores</div>
    ) : null;

  return <Center>{next}</Center>;
};

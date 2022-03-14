import { GameProps } from "../types";
import { RoundStart } from "./RoundStart";
import { TrumpReveal } from "./TrumpReveal";
import { BidInput } from "./BidInput";
import { BidsEnd } from "./BidsEnd";
import { SelectInput } from "./SelectInput";

export const TableCenter = ({ frame, controls }: GameProps) => {
  const {
    state: [type, game],
    ctx,
  } = frame;
  const { waitFor } = controls.meter;

  const vnode = (() => {
    if (type === "roundStart") {
      return <RoundStart num={game.round} waitFor={waitFor} />;
    }

    if (type === "trumpReveal") {
      return game.trumpCard ? (
        <TrumpReveal cardId={game.trumpCard} waitFor={waitFor} />
      ) : null;
    }

    if (type === "select") {
      return frame.player !== game.player ? (
        <div>Waiting for dealer to select trump...</div>
      ) : (
        <SelectInput select={controls.game.select} />
      );
    }

    if (type === "bid" || type === "bidded") {
      waitFor(500);
      return frame.player !== game.player ? (
        <h3 class="animate-bounce">Waiting for bids...</h3>
      ) : (
        <BidInput
          turn={game.round}
          bids={game.bids}
          submit={controls.game.bid}
          numPlayers={ctx.numPlayers}
        />
      );
    }

    if (type === "bidsEnd") {
      return <BidsEnd frame={frame} />;
    }

    if (type === "roundEnd") {
      return <div>TK Tally scores</div>;
    }

    return null;
  })();

  return (
    <div class="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">
      {vnode}
    </div>
  );
};

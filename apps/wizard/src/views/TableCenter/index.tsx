import { tw } from "twind";
import { fadeIn } from "@shared/twindCss";

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
  const isMyTurn = frame.player === game.player;

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
      return !isMyTurn ? (
        <h3 class={`animate-bounce text-center max-w-[150px]`}>
          Waiting for dealer to select trump...
        </h3>
      ) : (
        <SelectInput
          select={controls.game.select}
          waitFor={controls.meter.waitFor}
        />
      );
    }

    if (type === "bid" || type === "bidded") {
      return !isMyTurn ? (
        <div class="animate-bounce text-center">
          <h3 class={`${tw(fadeIn)}`}>
            Waiting for
            <br /> bids...
          </h3>
        </div>
      ) : type !== "bidded" ? (
        <BidInput
          turn={game.round}
          bids={game.bids}
          submit={controls.game.bid}
          numPlayers={ctx.numPlayers}
          waitFor={controls.meter.waitFor}
        />
      ) : null;
    }

    if (type === "bidsEnd") {
      waitFor(1500);
      return <BidsEnd frame={frame} />;
    }

    if (type === "roundEnd") {
    }

    if (type === "end") {
      return <div>Game over, man!</div>;
    }

    return null;
  })();

  return (
    <div class="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">
      {vnode}
    </div>
  );
};

import { useGame, cartActions } from "@src/control";

import { RoundStart } from "./RoundStart";
import { TrumpReveal } from "./TrumpReveal";
import { BidInput } from "./BidInput";
import { BidsEnd } from "./BidsEnd";
import { SelectInput } from "./SelectInput";
import { receive } from "@lib/globalUi";
import { delay } from "@lib/async/task";

export const TableCenter = () => {
  const { game, playerIndex } = useGame();
  const { phase, round, trumpCard, bids } = game;

  const vnode = (() => {
    const isMyTurn = playerIndex === game.player;

    if (phase === "roundStart") {
      return <RoundStart num={round} />;
    }

    if (phase === "trumpReveal") {
      return trumpCard ? <TrumpReveal cardId={trumpCard} /> : null;
    }

    if (phase === "select") {
      return !isMyTurn ? (
        <h3 class={`animate-pulse text-center max-w-[150px]`}>
          Waiting for dealer to select trump...
        </h3>
      ) : (
        <SelectInput select={cartActions.select} />
      );
    }

    if (phase === "bid" || phase === "bidded") {
      return !isMyTurn ? (
        <div class="animate-fadeIn">
          <div class="animate-pulse text-center">
            <h3>
              Waiting for
              <br /> bids...
            </h3>
          </div>
        </div>
      ) : phase !== "bidded" ? (
        <BidInput />
      ) : null;
    }

    if (phase === "bidsEnd") {
      receive(delay(2000));
      return <BidsEnd bids={bids} round={round} />;
    }

    if (phase === "roundEnd") {
      return (
        <div class="animate-fadeIn text-center">
          <h3>Round complete.</h3>
        </div>
      );
    }

    if (phase === "end") {
      return <div>Game over, man!</div>;
    }

    return null;
  })();

  return <div class="absolute top-1/2 left-1/2 translate-center">{vnode}</div>;
};

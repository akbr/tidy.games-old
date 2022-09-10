import { GameProps } from "@lib/tabletop/preact";
import { WizardSpec } from "src/game/spec";

import { RoundStart } from "./RoundStart";
import { TrumpReveal } from "./TrumpReveal";
import { BidInput } from "./BidInput";
import { BidsEnd } from "./BidsEnd";
import { SelectInput } from "./SelectInput";
import { receive } from "@lib/globalUi";
import { delay } from "@lib/async/task";

export const TableCenter = (props: GameProps<WizardSpec>) => {
  const { state, room } = props.frame;
  const { actions } = props;

  const vnode = (() => {
    const isMyTurn = room.player === state.player;

    if (state.phase === "roundStart") {
      return <RoundStart num={state.round} />;
    }

    if (state.phase === "trumpReveal") {
      return state.trumpCard ? <TrumpReveal cardId={state.trumpCard} /> : null;
    }

    if (state.phase === "select") {
      return !isMyTurn ? (
        <h3 class={`animate-pulse text-center max-w-[150px]`}>
          Waiting for dealer to select trump...
        </h3>
      ) : (
        <SelectInput select={actions.cart.select} />
      );
    }

    if (state.phase === "bid" || state.phase === "bidded") {
      return !isMyTurn ? (
        <div class="animate-fadeIn">
          <div class="animate-pulse text-center">
            <h3>
              Waiting for
              <br /> bids...
            </h3>
          </div>
        </div>
      ) : state.phase !== "bidded" ? (
        <BidInput {...props} />
      ) : null;
    }

    if (state.phase === "bidsEnd") {
      receive(delay(2000));
      return <BidsEnd bids={state.bids} round={state.round} />;
    }

    if (state.phase === "roundEnd") {
      return (
        <div class="animate-fadeIn text-center">
          <h3>Round complete.</h3>
        </div>
      );
    }

    if (state.phase === "end") {
      return <div>Game over, man!</div>;
    }

    return null;
  })();

  return <div class="absolute top-1/2 left-1/2 translate-center">{vnode}</div>;
};

import { GameProps } from "@lib/tabletop/preact/types";
import { useState } from "preact/hooks";
import { WizardSpec } from "../../game/spec";
import { checkBid } from "../../game/logic";

export function BidInput({ frame, actions }: GameProps<WizardSpec>) {
  const [bid, setBid] = useState(0);
  const { state, ctx } = frame;
  const bidErr = checkBid(bid, state, ctx.options);

  return (
    <div class="flex flex-col gap-[16px] text-center animate-fadeIn">
      <h3>Enter bid:</h3>
      <div class="flex justify-center items-center gap-[12px]">
        <button
          style={{ minWidth: "36px", minHeight: "36px" }}
          onClick={() => setBid(bid - 1)}
          disabled={bid === 0}
        >
          -
        </button>
        <div class="inline">{bid}</div>
        <button
          style={{ minWidth: "36px", minHeight: "36px" }}
          onClick={() => setBid(bid + 1)}
          disabled={bid === state.round}
        >
          +
        </button>
      </div>
      <button
        style={{ minWidth: "100px" }}
        disabled={!!bidErr}
        onClick={() => {
          actions.cart.bid(bid);
        }}
      >
        Bid
      </button>
    </div>
  );
}

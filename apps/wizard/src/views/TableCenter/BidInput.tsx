import { useState } from "preact/hooks";
import { useGame, cartActions } from "@src/control";
import { checkBid } from "../../game/logic";

export function BidInput() {
  const [bid, setBid] = useState(0);
  const { game, ctx } = useGame();

  const bidErr = checkBid(bid, game, ctx.options);

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
          disabled={bid === game.round}
        >
          +
        </button>
      </div>
      <button
        style={{ minWidth: "100px" }}
        disabled={!!bidErr}
        onClick={() => {
          cartActions.bid(bid);
        }}
      >
        Bid
      </button>
    </div>
  );
}

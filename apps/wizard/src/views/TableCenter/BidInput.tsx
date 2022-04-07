import { useState } from "preact/hooks";
import { RunDOMEffect } from "@lib/hooks";
import { vFadeInOut } from "@lib/hooks/domEffects";

import { GameProps } from "../types";
import { checkBid } from "../../game/logic";

export function BidInput({ frame, controls }: GameProps) {
  const [, game] = frame.state;

  const [bid, setBid] = useState(0);
  const [visibleState, setVisibleState] = useState<"in" | "out">("in");

  const bidErr = checkBid(bid, game, frame.ctx.options);

  return (
    <RunDOMEffect
      fn={vFadeInOut}
      props={visibleState}
      waitFor={controls.meter.waitFor}
    >
      <div class={`flex flex-col gap-[16px] text-center`}>
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
          disabled={visibleState === "out" || !!bidErr}
          onClick={() => {
            setVisibleState("out");
            setTimeout(() => controls.game.bid(bid), 0);
          }}
        >
          Bid
        </button>
      </div>
    </RunDOMEffect>
  );
}

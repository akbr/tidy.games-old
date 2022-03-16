import { useState } from "preact/hooks";
import { RunDOMEffect } from "@lib/hooks";
import { vFadeInOut } from "@lib/hooks/domEffects";
import { WaitFor } from "@lib/state/meter";

type BidInputProps = {
  canadian?: boolean;
  bids: (number | null)[];
  turn: number;
  numPlayers: number;
  submit: (bid: number) => void;
  waitFor: WaitFor;
};

export function BidInput({ turn, submit, waitFor }: BidInputProps) {
  const [bid, setBid] = useState(0);
  const [state, setState] = useState<"in" | "out">("in");

  return (
    <RunDOMEffect fn={vFadeInOut} props={state} waitFor={waitFor}>
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
            disabled={bid === turn}
          >
            +
          </button>
        </div>
        <button
          style={{ minWidth: "100px" }}
          disabled={state === "out"}
          onClick={() => {
            setState("out");
            setTimeout(() => submit(bid), 0);
          }}
        >
          Bid
        </button>
      </div>
    </RunDOMEffect>
  );
}

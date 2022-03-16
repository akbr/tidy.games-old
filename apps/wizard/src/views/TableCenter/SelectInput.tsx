import { useState } from "preact/hooks";
import { RunDOMEffect } from "@lib/hooks";
import { vFadeInOut } from "@lib/hooks/domEffects";
import { WaitFor } from "@lib/state/meter";

type TrumpInputProps = {
  select: (trump: string) => void;
  waitFor: WaitFor;
};

export function SelectInput({ select, waitFor }: TrumpInputProps) {
  const [suit, setSuit] = useState("c");
  const [state, setState] = useState<"in" | "out">("in");

  return (
    <RunDOMEffect fn={vFadeInOut} props={state} waitFor={waitFor}>
      <div class="flex flex-col items-center text-center gap-[16px] max-w-[175px]">
        <h3>Choose trump:</h3>
        <select
          name="suits"
          style={{ maxWidth: "100px" }}
          onChange={(e) => {
            //@ts-ignore
            setSuit(e.target.value);
          }}
        >
          <option value="c">Clubs ♣</option>
          <option value="d">Diamonds ♦</option>
          <option value="h">Hearts ♥</option>
          <option value="s">Spades ♠</option>
        </select>
        <button
          disabled={state === "out"}
          onClick={(e) => {
            setState("out");
            setTimeout(() => select(suit), 0);
          }}
        >
          Select
        </button>
      </div>
    </RunDOMEffect>
  );
}

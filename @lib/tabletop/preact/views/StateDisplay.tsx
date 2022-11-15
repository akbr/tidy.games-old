import { Spec } from "../../core";
import { GameFrame } from "../../client";
import { JSONDiff } from "@lib/meter/preact";

export function StateDisplay<S extends Spec>({
  curr,
  prev,
}: {
  curr: GameFrame<S>;
  prev?: GameFrame<S>;
}) {
  return (
    <>
      {curr?.action && (
        <div class="font-bold">{JSON.stringify(curr.action)}</div>
      )}
      {curr?.board && (
        <JSONDiff
          curr={curr.board}
          prev={prev && prev.board ? prev.board : {}}
        />
      )}
    </>
  );
}

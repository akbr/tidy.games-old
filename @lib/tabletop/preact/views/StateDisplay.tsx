import { Spec } from "../../core";
import { GameState } from "../../client";
import { JSONDiff } from "@lib/meter/preact";

export function StateDisplay<S extends Spec>({
  curr,
  prev,
}: {
  curr: GameState<S>;
  prev?: GameState<S>;
}) {
  return (
    <>
      {curr?.action && (
        <div class="font-bold">{JSON.stringify(curr.action)}</div>
      )}
      {curr?.game && (
        <JSONDiff curr={curr.game} prev={prev && prev.game ? prev.game : {}} />
      )}
    </>
  );
}

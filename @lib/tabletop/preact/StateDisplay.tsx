import { Spec } from "../core";
import { MeterState } from "../client";
import { JSONDiff } from "@lib/meter/preact";

export function StateDisplay<S extends Spec>({
  curr,
  prev,
}: {
  curr: MeterState<S>;
  prev?: MeterState<S>;
}) {
  return (
    <>
      {curr?.action && (
        <div class="font-bold">{JSON.stringify(curr.action)}</div>
      )}
      {curr?.state && (
        <JSONDiff
          curr={curr.state}
          prev={prev && prev.state ? prev.state : {}}
        />
      )}
    </>
  );
}

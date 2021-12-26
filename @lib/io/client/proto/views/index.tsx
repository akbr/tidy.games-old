import { EngineTypes } from "@lib/io/engine";
import { ClientState } from "@lib/io/client";

import { memo } from "preact/compat";

import { JSONDiff } from "./json";

export function App<ET extends EngineTypes>({
  curr,
  prev,
}: {
  curr: ClientState<ET>;
  prev: ClientState<ET>;
}) {
  if (!curr.server) return null;

  return (
    <>
      <div class="font-mono text-sm">
        GAME: {curr.server.id}, SEATS: {curr.server.seats.length}
      </div>
      <br />
      <div class="max-w-[400px]">
        {curr ? (
          <StateDisplay curr={curr.state} prev={prev ? prev.state : null} />
        ) : (
          "Waiting..."
        )}
      </div>
    </>
  );
}

const StateDisplay = memo(
  <ET extends EngineTypes>({
    curr,
    prev,
  }: {
    curr: ClientState<ET>["state"];
    prev: ClientState<ET>["state"];
  }) => {
    if (!curr) return null;
    return (
      <>
        <div class="font-bold text-lg">
          <JSONDiff
            curr={{ type: curr.type }}
            prev={prev ? { type: prev.type } : null}
          />
        </div>
        <JSONDiff curr={curr.data} prev={prev ? prev.data : null} />
      </>
    );
  },
  (prevProps, { curr, prev }) => curr === prev
);

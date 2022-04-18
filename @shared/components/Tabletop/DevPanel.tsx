import { Spec } from "@lib/tabletop/spec";
import { Client } from "@lib/tabletop/client";

import { JSONDiff } from "@shared/components/JsonDiff";

export function DevPanel<S extends Spec>({ client }: { client: Client<S> }) {
  return (
    <div class="h-full flex font-mono text-black">
      <Nav client={client} />
      <FrameDisplay client={client} />
    </div>
  );
}

function Nav<S extends Spec>({ client }: { client: Client<S> }) {
  return (
    <section
      id="debug-nav"
      class="h-full overflow-hidden bg-gray-400 w-[175px] p-1 text-sm"
    >
      <div class="h-full overflow-hidden flex flex-col gap-1">
        <Controls client={client} />
        <div class="overflow-y-auto">
          <ListView client={client} />
        </div>
      </div>
    </section>
  );
}

function Controls<S extends Spec>({ client }: { client: Client<S> }) {
  const { states, idx, auto } = client.meter.get();
  const { setIdx, play } = client.meter;

  const atMin = idx === 0;
  const atMax = idx === states.length - 1;

  if (client.get()[0] !== "game") {
    return (
      <div class="text-center animate-pulse m-2">Waiting for frame...</div>
    );
  }

  return (
    <div class="flex items-center gap-1 justify-center">
      <button class="cursor-pointer" disabled={atMin} onClick={() => setIdx(0)}>
        {"<<"}
      </button>
      <button
        class="cursor-pointer"
        disabled={atMin}
        onClick={() => setIdx((idx) => idx - 1)}
      >
        {"<"}
      </button>
      <button class="cursor-pointer" onClick={() => play()}>
        {auto ? "Pause" : "Play"}
      </button>
      <button
        class="cursor-pointer"
        disabled={atMax}
        onClick={() => setIdx((idx) => idx + 1)}
      >
        {">"}
      </button>
      <button
        class="cursor-pointer"
        disabled={atMax}
        onClick={() => setIdx((_, length) => length - 1)}
      >
        {">>"}
      </button>
    </div>
  );
}

function ListView<S extends Spec>({ client }: { client: Client<S> }) {
  const { states, idx } = client.meter.get();
  const { setIdx } = client.meter;

  return (
    <div>
      {states.map((frame, i) => (
        <div
          class="cursor-pointer p-1 rounded"
          style={{ backgroundColor: idx === i ? "orange" : "" }}
          onClick={() => setIdx(i)}
        >
          {i +
            " " +
            JSON.stringify(frame.state[0]) +
            (frame.action ? `(${frame.action.type})` : "")}
        </div>
      ))}
    </div>
  );
}

function FrameDisplay<S extends Spec>({ client }: { client: Client<S> }) {
  const { meter } = client;
  const [, clientState] = client.get();

  const { state, states, idx } = meter.get();

  const frame = state;
  const curr = frame ? frame.state[1] : null;
  const prev = states[idx - 1] ? states[idx - 1].state[1] : {};

  return (
    <section
      id="debug-json"
      class="flex flex-col gap-4 bg-gray-200 w-[175px] p-2 text-xs overflow-hidden break-all"
    >
      {!frame && "room" in clientState && (
        <div>
          <div class="font-bold text-lg">Room</div>
          <JSONDiff curr={clientState.room} prev={clientState.room} />
        </div>
      )}
      {frame && (
        <div>
          <div class="font-bold text-lg">Game</div>
          <div class="font-bold">phase: {frame.state[0]}</div>
          <JSONDiff curr={frame.state[1]} prev={prev} />
        </div>
      )}
      {frame && (
        <div>
          <div class="font-bold text-lg">Ctx</div>
          <JSONDiff curr={frame.ctx} prev={frame.ctx} />
        </div>
      )}
      {frame && frame.action && (
        <div>
          <div class="font-bold text-lg">Action</div>
          <JSONDiff curr={frame.action} prev={{}} />
        </div>
      )}
    </section>
  );
}

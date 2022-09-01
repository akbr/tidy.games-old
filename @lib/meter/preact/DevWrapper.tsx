import { ComponentChildren } from "preact";
import useStore from "@lib/store/useSubscribe";
import type { Meter } from "../meter";

function StateList<T>({
  meter,
  stateDisplay,
}: {
  meter: Meter<T>;
  stateDisplay?: (input: T) => JSX.Element;
}) {
  const { states, idx } = useStore(meter, (x) => x);
  const { setIdx } = meter.actions;
  const sd = stateDisplay || ((x) => <div>{JSON.stringify(x)}</div>);

  return (
    <div class="overflow-y-auto">
      {states.map((state, i) => (
        <div
          class="cursor-pointer p-1 rounded text-xs"
          style={{ backgroundColor: idx === i ? "orange" : "" }}
          onClick={() => setIdx(i)}
        >
          {i + " "}
          {sd(state)}
        </div>
      ))}
    </div>
  );
}

function MeterConsole<T>({
  meter,
  stateDisplay,
}: {
  meter: Meter<T>;
  stateDisplay?: (input: T) => JSX.Element;
}) {
  const { playing, waitingFor } = useStore(meter, (x) => x);

  return (
    <section
      id="debug-json"
      class="h-full flex flex-col gap-4 bg-gray-200 w-[175px] text-black p-2 break-all"
    >
      <div>
        <button onClick={() => meter.actions.setPlay((x) => !x)}>
          {playing ? "pause" : "play"}
        </button>
        <div>Waiting: {waitingFor.length}</div>
      </div>

      <StateList meter={meter} stateDisplay={stateDisplay} />
    </section>
  );
}

export function DevWrapper<T>({
  meter,
  children,
  stateDisplay,
}: {
  meter: Meter<T>;
  children: ComponentChildren;
  stateDisplay?: (input: T) => JSX.Element;
}) {
  return (
    <div class="h-full flex flex-row">
      <MeterConsole meter={meter} stateDisplay={stateDisplay} />
      {children}
    </div>
  );
}

export default DevWrapper;

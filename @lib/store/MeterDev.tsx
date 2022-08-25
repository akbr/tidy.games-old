import { ComponentChildren } from "preact";
import type { Meter } from "./meter";
import useStore from "./useStore";

function StateList<T>({ meter }: { meter: Meter<T> }) {
  const { states, idx } = useStore(meter, (x) => x);
  const { setIdx } = meter.actions;

  return (
    <div>
      {states.map((state, i) => (
        <div
          class="cursor-pointer p-1 rounded"
          style={{ backgroundColor: idx === i ? "orange" : "" }}
          onClick={() => setIdx(i)}
        >
          {i + " " + JSON.stringify(state)}
        </div>
      ))}
    </div>
  );
}

function MeterConsole<T>({ meter }: { meter: Meter<T> }) {
  const { states, playing, waitingFor } = useStore(meter, (x) => x);

  return (
    <section
      id="debug-json"
      class="h-full flex flex-col gap-4 bg-gray-200 w-[175px] p-2 break-all"
    >
      <div>
        <button onClick={() => meter.actions.setPlay((x) => !x)}>
          {playing ? "pause" : "play"}
        </button>
        <div>Waiting: {waitingFor.length}</div>
      </div>

      <StateList meter={meter} />
    </section>
  );
}

export function MeterDev<T>({
  meter,
  children,
}: {
  meter: Meter<T>;
  children: ComponentChildren;
}) {
  return (
    <div class="h-full flex flex-row">
      <MeterConsole meter={meter} />
      {children}
    </div>
  );
}

export default MeterDev;

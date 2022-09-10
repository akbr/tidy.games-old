import { ComponentChildren, FunctionComponent } from "preact";
import useStore from "@lib/store/useSubscribe";
import type { Meter } from "../meter";
import { useLayoutEffect, useRef } from "preact/hooks";
import { memo } from "preact/compat";

type StateDisplay<T> = FunctionComponent<{ curr: T; prev?: T }>;

function StateList<T>({ meter, SD }: { meter: Meter<T>; SD: StateDisplay<T> }) {
  const ref = useRef<HTMLDivElement>(null);
  const { states, idx } = useStore(meter, ({ states, idx }) => ({
    states,
    idx,
  }));
  const { setIdx } = meter.actions;
  useLayoutEffect(() => {
    const $el = ref.current! as any;
    if ($el.scrollIntoViewIfNeeded) {
      $el.scrollIntoViewIfNeeded();
    } else {
      $el.scrollIntoView();
    }
  });

  return (
    <div class="overflow-y-auto">
      {states.map((state, i, arr) => {
        const isFocused = idx === i;

        return (
          <div
            key={i}
            class="cursor-pointer p-1 rounded text-xs"
            style={{
              backgroundColor: isFocused ? "#FED8B1" : "",
            }}
            onClick={() => setIdx(i)}
            ref={isFocused ? ref : undefined}
          >
            {i + " "}
            <SD curr={state} prev={arr[i - 1]} />
          </div>
        );
      })}
    </div>
  );
}

function MeterConsole<T>({
  meter,
  children,
}: {
  meter: Meter<T>;
  children: ComponentChildren;
}) {
  const { playing, waitingFor } = useStore(
    meter,
    ({ playing, waitingFor }) => ({ playing, waitingFor })
  );

  return (
    <section
      id="debug-json"
      class="h-full flex flex-col gap-4 bg-gray-200 w-[175px] text-black p-2 break-all"
    >
      <div class="text-center">
        <button onClick={() => meter.actions.setIdx((x) => x - 1)}>
          {"⬅️"}
        </button>
        <button onClick={() => meter.actions.setPlay((x) => !x)}>
          {playing ? "⏸️" : "▶️"}
        </button>
        <button onClick={() => meter.actions.setIdx((x) => x + 1)}>
          {"➡️"}
        </button>
        <div>Waiting: {waitingFor.length}</div>
      </div>
      {children}
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
  stateDisplay: StateDisplay<T>;
}) {
  return (
    <div class="h-full flex flex-row">
      <MeterConsole meter={meter}>
        <StateList meter={meter} SD={memo(stateDisplay)} />
      </MeterConsole>
      {children}
    </div>
  );
}

export default DevWrapper;

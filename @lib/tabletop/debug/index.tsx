import { ComponentChildren, FunctionComponent, render } from "preact";
import { useRef, useState } from "preact/hooks";
import { createMeter, MeterUpdate } from "@lib/state/meter2";

import { createMachine, GameDefinition, getFrames, Spec } from "..";
import { Frame, ConnectedActions, createActionFns } from "../utils";
import { MachineOptions } from "../machine";

const ListView = <S extends Spec>({
  entries,
  idx,
  setIdx,
}: {
  entries: Frame<S>[];
  idx: number;
  setIdx: (n: number) => void;
}) => {
  return (
    <div>
      {entries.map((entry, i) => (
        <div
          class="cursor-pointer p-1 rounded"
          style={{ backgroundColor: idx === i ? "orange" : "" }}
          onClick={() => setIdx(i)}
        >
          {JSON.stringify(entry.gameState[0])}
        </div>
      ))}
    </div>
  );
};

const Controls = ({
  idx,
  length,
  setIdx,
}: {
  idx: number;
  length: number;
  setIdx: (n: number) => void;
}) => {
  const atMin = idx === 0;
  const atMax = idx === length - 1;

  return (
    <div class="flex items-center gap-1 justify-center">
      <button class="cursor-pointer" disabled={atMin} onClick={() => setIdx(0)}>
        {"<<"}
      </button>
      <button
        class="cursor-pointer"
        disabled={atMin}
        onClick={() => setIdx(idx - 1)}
      >
        {"<"}
      </button>
      <div class="inline-block">
        {idx}/{length - 1}
      </div>
      <button
        class="cursor-pointer"
        disabled={atMax}
        onClick={() => setIdx(idx + 1)}
      >
        {">"}
      </button>
      <button
        class="cursor-pointer"
        disabled={atMax}
        onClick={() => setIdx(length - 1)}
      >
        {">>"}
      </button>
    </div>
  );
};

const ActionEntry: FunctionComponent<{
  type: string;
  fn: Function;
  player: number;
}> = ({ type, fn, player }) => {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input ref={ref} style={{ width: "32px" }} />
      <button
        onClick={() => {
          fn(player, ref.current!.value);
          ref.current!.value = "";
        }}
      >
        {type}
      </button>
    </div>
  );
};

const ActionPane = <S extends Spec>({
  numPlayers,
  actions,
}: {
  numPlayers: number;
  actions: ConnectedActions<S>;
}) => {
  const [player, setPlayer] = useState(0);

  return (
    <div class="text-center">
      <span>As player: </span>
      <select
        onChange={(e) => {
          //@ts-ignore
          setPlayer(parseInt(e.target.value));
        }}
      >
        {Array.from({ length: numPlayers }).map((_, idx) => {
          return <option value={`${idx}`}>{idx}</option>;
        })}
      </select>
      <div>
        {Object.entries(actions).map(([key, fn]) => (
          <ActionEntry
            key={key}
            type={key}
            fn={fn as Function}
            player={player}
          />
        ))}
      </div>
    </div>
  );
};

type DebugProps<S extends Spec> = {
  meter: MeterUpdate<Frame<S>>;
  actions: ConnectedActions<S>;
};

export const Nav = <S extends Spec>({ meter, actions }: DebugProps<S>) => {
  const { states, idx, auto, setIdx, waitFor } = meter;

  return (
    <div class="h-full flex flex-col justify-between overflow-hidden">
      <div class="h-full overflow-hidden flex flex-col gap-1">
        <Controls idx={idx} length={states.length} setIdx={setIdx} />
        <div class="overflow-y-auto">
          <ListView entries={states} idx={idx} setIdx={setIdx} />
        </div>
      </div>
      <div>
        <ActionPane actions={actions} numPlayers={2} />
      </div>
    </div>
  );
};

export const JSONPair = ({
  oKey,
  value,
  equal,
}: {
  oKey: string;
  value: any;
  equal: boolean;
}) => {
  return (
    <div>
      <pre
        class={
          (equal ? "" : "bg-yellow-300 text-black p-[2px]") + " inline-block"
        }
      >
        {oKey}: {typeof value === "object" ? JSON.stringify(value) : value}
      </pre>
    </div>
  );
};

export const alphabetizeKeys = <T extends Record<string, any>>(obj: T): T => {
  const keys = Object.keys(obj).sort() as (keyof T)[];
  const next = {} as T;
  keys.forEach((key) => {
    next[key] = obj[key];
  });
  return next;
};

export const JSONDiff = ({
  curr,
  prev,
}: {
  curr: Record<string, any>;
  prev: Record<string, any>;
}) => {
  const aCurr = alphabetizeKeys(curr);
  return (
    <>
      {Object.entries(aCurr).map(([oKey, value]) => (
        <JSONPair
          oKey={oKey}
          value={value}
          equal={!prev || curr[oKey] === prev[oKey]}
        />
      ))}
    </>
  );
};

export const DebugPanel = <S extends Spec>({
  meter,
  actions,
  children,
}: DebugProps<S> & { children?: ComponentChildren }) => {
  const { states, state, idx, auto, setIdx, waitFor } = meter;
  const curr = state.gameState[1];
  const prev = states[idx - 1] ? states[idx - 1].gameState[1] : curr;

  return (
    <section id="debug" class="h-full flex">
      <section
        id="debug-nav"
        class="h-full bg-gray-400 w-[175px] p-1 font-mono text-sm"
      >
        <Nav meter={meter} actions={actions} />
      </section>
      <section
        id="debug-json"
        class="h-full bg-gray-200 w-[175px] p-2 text-xs overflow-hidden"
      >
        <JSONDiff curr={curr} prev={prev} />
      </section>
      <section id="debug-app" class="h-full flex-grow">
        {children}
      </section>
    </section>
  );
};

export function createDebugView<S extends Spec>(
  def: GameDefinition<S>,
  options: MachineOptions<S>,
  $el: HTMLElement,
  Game: FunctionComponent<{ frame: Frame<S> }>
) {
  const machine = createMachine(def, options);
  if (typeof machine === "string") throw new Error(machine);

  const meter = createMeter<Frame<S>>();

  const nextRender = () => {
    const frames = getFrames(machine.get());
    meter.push(...frames);
  };

  const actions = createActionFns(def.actionStubs, (player, action) => {
    const res = machine.submit(action, player);
    if (res) return console.warn(res);
    nextRender();
  });

  meter.subscribe((update) => {
    render(
      <DebugPanel meter={update} actions={actions}>
        <Game frame={update.state} />
      </DebugPanel>,
      $el
    );
  });

  nextRender();

  return { machine, actions };
}

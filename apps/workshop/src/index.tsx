import { h, Fragment, render, FunctionComponent } from "preact";
import { useRefreshOnResize } from "@lib/hooks";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
// -------------------------------
import { createStore } from "@lib/state/store";
import { JSONDiff } from "./protoView/json";
import { GameDefinition, Spec } from "@lib/tabletop";
import { Ctx } from "@lib/tabletop/types";
import { MachineOptions, createMachine } from "@lib/tabletop/machine";
import {
  createActionFns,
  getFrames,
  Frame,
  ConnectedAction,
} from "@lib/tabletop/utils";
import { lastOf } from "@lib/array";
import { wizardDefinition, WizardSpec } from "@apps/wizard2/game";
import { createMeter, MeterUpdate } from "@lib/state/meter2";
import { style } from "@lib/stylus";
import { TrickSection } from "@lib/components/TrickSection";
import { HandSection } from "@lib/components/HandSection";
import { HandCard } from "./HandCard";

import { setup } from "@twind/preact";

setup({
  props: {
    className: true,
  },
  preflight: false,
});

const ListView = ({
  entries,
  idx,
  setIdx,
}: {
  entries: Record<string, any>[];
  idx: number;
  setIdx: (n: number) => void;
}) => {
  return (
    <div class="text-white">
      {entries.map((entry, i) => (
        <div
          class="cursor-pointer"
          style={{ color: idx === i ? "orange" : "" }}
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
    <div>
      <button disabled={atMin} onClick={() => setIdx(0)}>
        {"<<"}
      </button>
      <button disabled={atMin} onClick={() => setIdx(idx - 1)}>
        {"<"}
      </button>
      <div class="inline-block">
        {idx}/{length - 1}
      </div>
      <button disabled={atMax} onClick={() => setIdx(idx + 1)}>
        {">"}
      </button>
      <button disabled={atMax} onClick={() => setIdx(length - 1)}>
        {">>"}
      </button>
    </div>
  );
};

const ActionEntry = ({
  type,
  fn,
  player,
}: {
  type: string;
  fn: Function;
  player: number;
}) => {
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

const ActionPane = ({
  numPlayers,
  actions,
}: {
  numPlayers: number;
  actions: Record<string, Function>;
}) => {
  const [player, setPlayer] = useState(0);

  return (
    <div>
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
          <ActionEntry key={key} type={key} fn={fn} player={player} />
        ))}
      </div>
    </div>
  );
};

const Display = ({
  obj,
  waitFor,
}: {
  obj: Record<string, any>;
  waitFor: Function;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    waitFor(
      style(ref.current!, [{ opacity: 0, rotate: 20 }, { opacity: 1 }], {
        duration: 1000,
      })
    );
  });

  return <div ref={ref}>{JSON.stringify(obj)}</div>;
};

const View = ({
  meter,
  actions,
}: {
  meter: MeterUpdate<Record<string, any>>;
  actions: Record<string, any>;
}) => {
  const { state, states, idx, auto, setIdx, waitFor } = meter;
  const curr = state.gameState[1];
  const prevState = states[idx - 1] || state;
  const prev = prevState.gameState[1];

  waitFor(1000);

  return (
    <div class="flex h-full text-white">
      <div class="h-full min-w-[175px] p-2 bg-black bg-opacity-20">
        <div class="h-full flex flex-col justify-between">
          <div>
            <Controls idx={idx} length={states.length} setIdx={setIdx} />
            <ListView entries={states} idx={idx} setIdx={setIdx} />
          </div>
          <div>
            <ActionPane actions={actions} numPlayers={2} />
          </div>
        </div>
      </div>
      <div class="h-full w-full m-2 relative">
        <div>
          <JSONDiff curr={curr} prev={prev} />
        </div>
        <HandSection>
          {curr.hands[0].map((cardId: any) => (
            <HandCard key={cardId} play={() => undefined} card={cardId} />
          ))}
        </HandSection>
      </div>
    </div>
  );
};

function createProtoView<S extends Spec>(
  def: GameDefinition<S>,
  options: MachineOptions<S>,
  $el: HTMLElement
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
      <View meter={update} actions={actions} />,
      document.getElementById("app")!
    );
  });

  nextRender();

  return { machine, actions };
}

createProtoView(
  wizardDefinition,
  {
    ctx: {
      numPlayers: 2,
      options: null,
      seed: "test",
    },
  },
  document.getElementById("app")!
);

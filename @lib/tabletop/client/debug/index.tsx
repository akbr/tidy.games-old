import { FunctionComponent, h } from "preact";
import { useRef, useState } from "preact/hooks";

import { Spec, ConnectedActions } from "../../types";
import { GameProps } from "..";

import { JSONDiff } from "./JsonDiff";

const ListView = <S extends Spec>({ meter, controls }: GameProps<S>) => {
  const { states, idx } = meter;
  const { setIdx } = controls.meter;

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
};

const Controls = ({ meter, controls }: GameProps<any>) => {
  const { states, idx, auto } = meter;
  const { setIdx, play } = controls.meter;

  const atMin = idx === 0;
  const atMax = idx === states.length - 1;

  return (
    <div class="flex items-center gap-1 justify-center">
      <button class="cursor-pointer" disabled={atMin} onClick={() => setIdx(0)}>
        {"<<"}
      </button>
      <button
        class="cursor-pointer"
        disabled={atMin}
        onClick={() => setIdx((idx) => idx + 1)}
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
  actions: ConnectedActions<S["actions"]>;
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

export const Nav = <S extends Spec>(props: GameProps<S>) => {
  return (
    <div class="h-full flex flex-col justify-between overflow-hidden">
      <div class="h-full overflow-hidden flex flex-col gap-1">
        <Controls {...props} />
        <div class="overflow-y-auto">
          <ListView {...props} />
        </div>
      </div>
    </div>
  );
};

export const DebugPanel = <S extends Spec>(props: GameProps<S>) => {
  const { meter, frame } = props;
  const { states, idx, auto } = meter;
  const state = states[idx];
  if (!state) return null;

  const curr = frame.state[1];
  const prev = states[idx - 1] ? states[idx - 1].state[1] : curr;

  return (
    <section id="debug" class="h-full flex">
      <section
        id="debug-nav"
        class="h-full bg-gray-400 w-[175px] p-1 font-mono text-sm  text-black"
      >
        <Nav {...props} />
      </section>
      <section
        id="debug-json"
        class="h-full bg-gray-200 w-[175px] p-2 text-xs overflow-hidden text-black"
      >
        <div class="font-mono font-bold text-lg">Game</div>
        <JSONDiff curr={curr} prev={prev} />
        {frame.action && (
          <div>
            <br />
            <div class="font-mono font-bold text-lg">Action</div>
            <JSONDiff curr={frame.action} prev={{}} />
          </div>
        )}
      </section>
    </section>
  );
};

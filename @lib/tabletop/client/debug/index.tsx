import { FunctionComponent } from "preact";
import { useRef, useState } from "preact/hooks";

import { Spec } from "../../types";
import { ConnectedActions } from "../helpers";
import { GameExProps } from "..";

import { JSONDiff } from "./JsonDiff";

const ListView = <S extends Spec>({
  states,
  idx,
  setIdx,
}: GameExProps<S>["meter"]) => {
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

const Controls = ({
  idx,
  states,
  setIdx,
  auto,
  togglePlay,
}: GameExProps<any>["meter"]) => {
  const length = states.length;
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
        onClick={() => setIdx(idx - 1)}
      >
        {"<"}
      </button>
      <button class="cursor-pointer" onClick={togglePlay}>
        {auto ? "Pause" : "Play"}
      </button>
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

export const Nav = <S extends Spec>({ meter }: GameExProps<S>) => {
  const { states, idx, state, auto, setIdx, waitFor } = meter;

  return (
    <div class="h-full flex flex-col justify-between overflow-hidden">
      <div class="h-full overflow-hidden flex flex-col gap-1">
        <Controls {...meter} />
        <div class="overflow-y-auto">
          <ListView {...meter} />
        </div>
      </div>
    </div>
  );
};

export const DebugPanel = <S extends Spec>(props: GameExProps<S>) => {
  const { meter, frame } = props;
  const { states, state, idx, auto, setIdx, waitFor } = meter;
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
import "preact/debug";
import { h, Fragment, render, FunctionComponent } from "preact";
import { useRefreshOnResize } from "@lib/hooks";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
// -------------------------------
import { createStore } from "@lib/state/store";

import { JSONDiff } from "./protoView/json";

const Controls = ({
  idx,
  length,
  set,
}: {
  idx: number;
  length: number;
  set: (n: number) => void;
}) => {
  const atMin = idx === 0;
  const atMax = idx === length - 1;

  return (
    <div>
      <button disabled={atMin} onClick={() => set(0)}>
        {"<<"}
      </button>
      <button disabled={atMin} onClick={() => set(idx - 1)}>
        {"<"}
      </button>
      <div class="inline-block">
        {idx}/{length - 1}
      </div>
      <button disabled={atMax} onClick={() => set(idx + 1)}>
        {">"}
      </button>
      <button disabled={atMax} onClick={() => set(length - 1)}>
        {">>"}
      </button>
    </div>
  );
};

const App2 = ({ objs }: { objs: Record<string, any>[] }) => {
  const [idx, setIdx] = useState(0);
  const curr = objs[idx];
  const prev = objs[idx - 1] || curr;

  return (
    <div>
      <Controls idx={idx} length={objs.length} set={setIdx} />
      {curr && <JSONDiff curr={curr} prev={prev} />}
    </div>
  );
};

const App = ({
  numPlayers,
  actions,
}: {
  numPlayers: number;
  actions: Record<string, Function>;
}) => {
  const ref = useRef<HTMLSelectElement>(null);
  const getPlayer = () => (ref.current ? parseInt(ref.current.value) : 0);

  return (
    <div>
      <span>As player: </span>
      <select ref={ref}>
        {Array.from({ length: numPlayers }).map((_, idx) => {
          return <option value={`${idx}`}>{idx}</option>;
        })}
      </select>
      <div>
        {Object.entries(actions).map(([key, fn]) => (
          <div>
            <input style={{ width: "32px" }} />
            <button onClick={() => console.log(key, getPlayer())}>{key}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

render(
  <App
    numPlayers={2}
    actions={{ select: () => 2, bid: () => 2, play: () => 2 }}
  />,
  document.getElementById("app")!
);

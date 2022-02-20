import type { Task } from "../async";
import { delay, all } from "../async";
import { createSubscription, Listener } from "./subscription";

export type WaitRequest = Task | number | null | undefined | void;
export type WaitFor = (req: WaitRequest) => void;
export type MeterControls = {
  setIdx: (idx: number) => void;
  waitFor: WaitFor;
  togglePlay: () => void;
};
export type MeterStatus<T> = {
  state: T;
  states: T[];
  idx: number;
  auto: boolean;
} & MeterControls;
export type Meter<T> = {
  push: (...states: T[]) => void;
  subscribe: (listener: Listener<MeterStatus<T>>) => () => void;
  get: () => MeterStatus<T>;
} & {
  controls: MeterControls;
};

export const createMeter = <T>(): Meter<T> => {
  const [subscribe, updateListeners] = createSubscription<MeterStatus<T>>();

  let idx = -1;
  let acceptingRequests = false;
  let auto = true;
  let active: Task | null = null;
  let waitRequests: WaitRequest[] = [];
  let queue: T[] = [];
  let states: T[] = [];

  function resolveAll() {
    if (active) active.skip();
    auto = false;
    active = null;
    queue = [];
  }

  function isAtLastState() {
    return idx >= states.length - 1;
  }

  function setIdx(inputIdx: number) {
    resolveAll();
    idx = inputIdx;
    updateListeners(get());
  }

  function waitFor(req: WaitRequest) {
    if (!acceptingRequests) return;
    waitRequests.push(req);
  }

  function get(): MeterStatus<T> {
    return {
      states,
      idx,
      state: states[idx],
      auto,
      setIdx,
      waitFor,
      togglePlay,
    };
  }

  function togglePlay() {
    auto = !auto;
    if (auto) iterate();
    if (!auto && active) resolveAll();
    updateListeners(get());
  }

  function push(...incoming: T[]) {
    queue.push(...incoming);
    states.push(...incoming);
    if (auto) iterate();
    updateListeners(get());
  }

  function iterate(): void {
    if (!auto || active) return;
    if (isAtLastState()) return;

    idx += 1;

    acceptingRequests = true;
    updateListeners(get());
    acceptingRequests = false;

    if (waitRequests.length === 0) return iterate();

    const timings = waitRequests.filter(
      (x) => typeof x === "number"
    ) as number[];
    const tasks = waitRequests.filter(
      (x) => typeof x !== "number" && x
    ) as Task[];
    waitRequests = [];

    if (timings.length) tasks.push(delay(Math.max(...timings)));
    if (!tasks.length) return iterate();

    const thisPending = all(tasks);
    active = thisPending;

    thisPending.finished.then(() => {
      if (active !== thisPending) return;
      active = null;
      iterate();
    });
  }

  return {
    push,
    subscribe,
    get,
    controls: {
      setIdx,
      waitFor,
      togglePlay,
    },
  };
};

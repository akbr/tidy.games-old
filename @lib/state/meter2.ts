import type { Task } from "../async";
import { delay, all } from "../async";
import { createSubscription, Listener } from "./subscription";

export type WaitRequest = Task | number | null | undefined;
export type MeterControls = {
  setIdx: (idx: number) => void;
  waitFor: (req: WaitRequest) => void;
};
export type MeterUpdate<T> = {
  state: T;
  states: T[];
  idx: number;
  auto: boolean;
} & MeterControls;
export type Meter<T> = {
  push: (...states: T[]) => void;
  subscribe: (listener: Listener<MeterUpdate<T>>) => () => void;
  get: () => MeterUpdate<T>;
} & MeterControls;

export const createMeter = <T>(): Meter<T> => {
  const [subscribe, updateListeners] = createSubscription<MeterUpdate<T>>();

  let idx = -1;
  let acceptingRequests = false;
  let auto = false;
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

  function get(): MeterUpdate<T> {
    return {
      states,
      idx,
      state: states[idx],
      auto,
      setIdx,
      waitFor,
    };
  }

  function push(...incoming: T[]) {
    const atLastState = isAtLastState();
    queue.push(...incoming);
    states.push(...incoming);
    if (atLastState) {
      auto = true;
      iterate(true);
    } else {
      updateListeners(get());
    }
  }

  function iterate(justPushed = false): void {
    if (!auto || active) return;
    if (isAtLastState() && !justPushed) return;

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
    if (!tasks.length) {
      return iterate();
    }

    const thisPending = all(tasks);
    active = thisPending;

    thisPending.finished.then(() => {
      if (active !== thisPending) return;
      active = null;
      if (isAtLastState()) {
        auto = false;
      }
      iterate();
    });
  }

  return {
    push,
    waitFor,
    subscribe,
    get,
    setIdx,
  };
};

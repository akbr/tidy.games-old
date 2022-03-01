import type { Task } from "../async";
import { delay, all } from "../async";
import { createSubscription, Listener } from "./subscription";

export type WaitRequest = Task | number | null | undefined | void;
export type WaitFor = (req: WaitRequest) => void;

export type Meter<T> = {
  push: (...states: T[]) => void;
  subscribe: (listener: Listener<MeterStatus<T>>) => () => void;
  reset: () => void;
  play: (toggle?: boolean) => void;
  setIdx: (idx: number | ((idx: number, length: number) => number)) => void;
  get: () => MeterStatus<T> | void;
  waitFor: WaitFor;
};

export type MeterStatus<T> = {
  states: T[];
  idx: number;
  waiting: boolean;
  auto: boolean;
};

export const createMeter = <T>(): Meter<T> => {
  const [subscribe, updateListeners] = createSubscription<MeterStatus<T>>();

  let states: T[] = [];
  let idx = -1;
  let auto = true;
  let waiting: Task | null = null;

  let waitRequests: WaitRequest[] = [];

  function getStatus() {
    return { states, idx, waiting: !!waiting, auto };
  }

  function update() {
    updateListeners(getStatus());
  }

  function isAtLastState() {
    return idx >= states.length - 1;
  }

  function clearWaiting() {
    if (waiting) waiting.skip();
    waiting = null;
  }

  function iterate(): false | void {
    if (waiting || !auto || isAtLastState()) return false;

    idx = idx + 1;

    update();

    // View might submit wait requests!

    if (waitRequests.length === 0) return iterate();

    const timings = waitRequests.filter(
      (x): x is number => typeof x === "number"
    );
    const tasks = waitRequests.filter(
      (x): x is Task => !!(typeof x !== "number" && x)
    );
    waitRequests = [];

    if (timings.length) tasks.push(delay(Math.max(...timings)));
    if (!tasks.length) return iterate();

    const thisPending = all(tasks);
    waiting = thisPending;

    thisPending.finished.then(() => {
      if (waiting !== thisPending) return;
      waiting = null;
      iterate();
    });
  }

  return {
    subscribe,
    push: (...incoming) => {
      states.push(...incoming);
      if (iterate() === false) update();
    },
    waitFor: (req) => {
      waitRequests.push(req);
    },
    reset: () => {
      states = [];
      idx = -1;
      auto = true;
      waiting = null;
    },
    play: (toggle) => {
      const nextAuto = toggle === undefined ? !auto : toggle;
      if (nextAuto === auto) return;
      if (auto === false) return;
      if (iterate() === false) update();
    },
    setIdx: (x) => {
      const nextIdx = typeof x === "function" ? x(idx, states.length) : x;
      if (!(nextIdx <= states.length - 1)) return;
      auto = false;
      clearWaiting();
      idx = nextIdx;
      update();
    },
    get: () => {
      return states.length ? getStatus() : undefined;
    },
  };
};

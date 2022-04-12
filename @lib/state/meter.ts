import type { Task } from "../async/task";
import { delay, all } from "../async/task";
import { createSubscription, Listener } from "./subscription";

export type WaitRequest = Task | number | null | undefined | void;
export type WaitFor = (req: WaitRequest) => void;

export type Meter<T> = {
  push: (...states: T[]) => void;
  subscribe: (listener: Listener<MeterStatus<T>>) => () => void;
  reset: () => void;
  play: (toggle?: boolean) => void;
  setIdx: (idx: number | ((idx: number, length: number) => number)) => void;
  get: () => MeterStatus<T>;
  waitFor: WaitFor;
};

export type MeterStatus<T> = {
  state?: T;
  states: T[];
  idx: number;
  waiting: boolean;
  auto: boolean;
};

type MeterOptions = {
  history?: boolean;
};

export const createMeter = <T>({ history = false }: MeterOptions): Meter<T> => {
  let state: T | undefined;
  let states: T[] = [];
  let idx = -1;
  let auto = true;
  let waiting: Task | null = null;

  const { subscribe, push } = createSubscription<MeterStatus<T>>(getStatus());

  let waitRequests: WaitRequest[] = [];

  function getStatus() {
    return { state, states, idx, waiting: !!waiting, auto };
  }

  function update() {
    push(getStatus());
  }

  function isExhausted() {
    return history ? idx === states.length - 1 : states.length === 0;
  }

  function compileWaiting() {
    if (waiting) return;

    const timings = waitRequests.filter(
      (x): x is number => typeof x === "number"
    );
    const tasks = waitRequests.filter(
      (x): x is Task => !!(typeof x !== "number" && x)
    );

    waitRequests = [];

    if (timings.length) tasks.push(delay(Math.max(...timings)));
    if (!tasks.length) return;

    const task = all(tasks);
    waiting = task;

    waiting.finished.then(() => {
      if (waiting === task) {
        waiting = null;
        iterate();
      }
    });
  }

  function iterate(): false | void {
    compileWaiting();

    if (waiting || !auto || isExhausted()) {
      return false;
    }
    if (history) {
      idx = idx + 1;
      state = states[idx];
    } else {
      state = states.shift();
    }

    update();
    compileWaiting();

    return iterate();
  }

  return {
    subscribe,
    push: (...incoming) => {
      states.push(...incoming);
      if (iterate() === false && history) update();
    },
    waitFor: (req) => {
      waitRequests.push(req);
    },
    reset: () => {
      state = undefined;
      states = [];
      idx = -1;
      auto = true;
      waiting = null;
    },
    play: (toggle) => {
      const nextValue = toggle === undefined ? !auto : toggle;
      if (nextValue === auto) return;
      auto = nextValue;
      if (auto === false) {
        update();
        return;
      } else if (iterate() === false) {
        update();
      }
    },
    setIdx: (input) => {
      if (!history) {
        return;
      }

      const nextIdx =
        typeof input === "function" ? input(idx, states.length) : input;
      if (nextIdx > states.length - 1) return;
      auto = false;
      waiting && waiting.skip();
      waiting = null;
      waitRequests = [];
      idx = nextIdx;
      state = states[nextIdx];
      update();
      compileWaiting();
    },
    get: () => getStatus(),
  };
};

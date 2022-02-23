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
  let auto = true;
  let active: Task | null = null;
  let waitRequests: WaitRequest[] = [];
  let autoQueue: T[] = [];
  let states: T[] = [];

  let prevStatus: MeterStatus<T>;
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

  function update() {
    const nextStatus = get();
    const prev = prevStatus;
    prevStatus = nextStatus;
    if (prev && prev.state === nextStatus.state) {
      return;
    }
    updateListeners(nextStatus);

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
    active = thisPending;

    thisPending.finished.then(() => {
      if (active !== thisPending) return;
      active = null;
      if (auto) iterate();
    });
  }

  function resolveAll() {
    if (active) active.skip();
    auto = false;
    active = null;
    autoQueue = [];
  }

  function isAtLastState() {
    return idx >= states.length - 1;
  }

  function setIdx(inputIdx: number) {
    resolveAll();
    idx = inputIdx;
    update();
  }

  function waitFor(req: WaitRequest) {
    waitRequests.push(req);
  }

  function togglePlay() {
    auto = !auto;
    if (auto) iterate();
    if (!auto) resolveAll();
    update();
  }

  function push(...incoming: T[]) {
    autoQueue.push(...incoming);
    states.push(...incoming);
    if (auto) iterate();
    update();
  }

  function iterate(): void {
    if (!auto || active || isAtLastState()) return;
    idx += 1;
    update();
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

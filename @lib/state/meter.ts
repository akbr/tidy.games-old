import type { Task } from "../async";
import { delay, all } from "../async";
import { createSubscription, Listener } from "./subscription";

type WaitRequest = Task | number | null | undefined;

export interface Meter<T> {
  push: (...states: T[]) => void;
  wait: (...req: WaitRequest[]) => void;
  skip: () => void;
  subscribe: (listener: Listener<T>) => () => void;
  subscribeStatus: (listener: Listener<boolean>) => () => void;
}

export const createMeter = <T>(): Meter<T> => {
  const [subscribe, update] = createSubscription<T>();
  const [subscribeStatus, updateStatus] = createSubscription<boolean>();

  const queue: T[] = [];
  let waitRequests: WaitRequest[] = [];
  let pending: Task | null;

  function nextState() {
    waitRequests = [];
    pending = null;
    iterate();
  }

  function iterate() {
    if (pending) return;

    if (queue.length === 0) {
      updateStatus(false);
      return;
    }

    updateStatus(true);

    update(queue.shift()!);

    // ...
    // listeners might have updated waitRequests for this frame
    // ...
    if (waitRequests.length !== 0) {
      let timings = waitRequests.filter(
        (x) => typeof x === "number"
      ) as number[];
      let tasks = waitRequests.filter(
        (x) => typeof x !== "number" && x
      ) as Task[];

      if (timings.length) tasks.push(delay(Math.max(...timings)));
      if (!tasks.length) {
        iterate();
        return;
      }
      const thisPending = all(tasks);
      pending = thisPending;

      thisPending.finished.then(() => {
        if (pending !== thisPending) {
          return;
        }
        nextState();
      });
    }
  }

  return {
    push: (...states) => {
      queue.push(...states);
      iterate();
    },
    wait: (...req) => {
      const filtered = req.filter((x) => x);
      if (filtered.length) waitRequests.push(...filtered);
    },
    subscribe,
    subscribeStatus,
    skip: () => {
      if (!pending) return;
      pending.skip();
      nextState();
    },
  };
};

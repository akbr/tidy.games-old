export type Task = {
  finish: () => void;
  finished: Promise<any>;
};

export type WaitRequest = number | Task;

export function getPromiseParts() {
  let resolve: (value: unknown) => void;
  let reject: (reason?: any) => void;
  let promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  //@ts-ignore
  return { promise, resolve, reject };
}

export const delay = (ms: number): Task => {
  let { promise, resolve } = getPromiseParts();
  let timeout = setTimeout(resolve, ms);
  return {
    finished: promise,
    finish: () => {
      clearTimeout(timeout);
      resolve(null);
    },
  };
};

export const all = (tasks: Task[]): Task => {
  let finished = Promise.all(tasks.map((t) => t.finished));
  return {
    finish: () => tasks.forEach((t) => t.finish()),
    finished,
  };
};

export const seq = (fns: (() => WaitRequest | void)[]): Task => {
  let { promise, resolve } = getPromiseParts();
  let pending: Task;
  let idx = -1;
  let skipping = false;

  function next() {
    idx = idx + 1;

    if (idx > fns.length - 1) {
      resolve(null);
      return;
    }

    let result = fns[idx]();

    if (result) {
      let task = typeof result === "number" ? delay(result) : result;
      pending = task;
      if (skipping) {
        pending.finish();
      } else {
        pending.finished.then(next);
      }
    }

    if (!result || skipping) next();
  }

  next();

  return {
    finish: () => {
      skipping = true;
      if (pending) pending.finish();
      next();
    },
    finished: promise,
  };
};

export interface Meter<T> {
  push: (...states: T[]) => void;
  waitFor: (...req: WaitRequest[]) => void;
  subscribe: (emit: (t: T) => void) => () => void;
  empty: () => void;
}

export const createMeter = <T>() => {
  let queue: T[] = [];
  let waitRequests: WaitRequest[] = [];
  let listeners: ((t: T) => void)[] = [];
  let pending: Task | void;

  function go() {
    if (pending) return;
    if (queue.length === 0) return;

    let nextState = queue.shift()!;
    listeners.forEach((fn) => fn(nextState));

    if (waitRequests.length !== 0) {
      let timings = waitRequests.filter(
        (x) => typeof x === "number"
      ) as number[];
      let tasks = waitRequests.filter((x) => typeof x !== "number") as Task[];
      if (timings.length) tasks.push(delay(Math.max(...timings)));
      pending = all(tasks);
      pending.finished.then(() => {
        waitRequests = [];
        pending = undefined;
        go();
      });
    }

    go();
  }

  return <Meter<T>>{
    push: (...states) => {
      queue.push(...states);
      go();
    },
    waitFor: (...req) => {
      waitRequests.push(...req);
    },
    subscribe: (emit) => {
      listeners.push(emit);
      return () => {
        listeners = listeners.filter((x) => x !== emit);
      };
    },
    empty: () => {
      queue = [];
    },
  };
};

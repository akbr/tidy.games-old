export interface Task<T = any> {
  finished: Promise<T>;
  skip: () => void;
}

export function taskOf<T>(task: Task<T>): Task<T> {
  let done = false;
  return {
    ...task,
    skip: () => {
      if (done) return;
      done = true;
      task.skip();
    },
  };
}

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

const noop = function () {};

export const delay = (ms: number, fn = noop): Task => {
  const { promise, resolve } = getPromiseParts();
  const timeout = setTimeout(() => {
    resolve(fn());
  }, ms);
  return taskOf({
    finished: promise,
    skip: () => {
      clearTimeout(timeout);
      resolve(fn());
    },
  });
};

export const all = (tasks: Task[]): Task<any> => {
  const { promise, resolve } = getPromiseParts();

  Promise.all(tasks.map((t) => t.finished)).then(() => {
    resolve(null);
  });
  return taskOf({
    finished: promise as Promise<null>,
    skip: () => {
      tasks.forEach((t) => t.skip());
      resolve(null);
    },
  });
};

export const seq = (fns: (() => Task | void)[]): Task => {
  const { promise, resolve } = getPromiseParts();

  let pending: Task | void;
  let idx = -1;
  let skipping = false;

  function iterate() {
    if (skipping && pending) pending.skip();

    idx = idx + 1;
    if (idx >= fns.length) return resolve(null);

    pending = fns[idx]();
    if (pending && !skipping) pending.finished.then(iterate);

    if (!pending || skipping) iterate();
  }

  iterate();

  return taskOf({
    finished: promise,
    skip: () => {
      skipping = true;
      iterate();
    },
  });
};

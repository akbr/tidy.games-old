import type { Task } from "@lib/async/task";
import { createSubscription, Subscribable } from "../store/subscription";

export type MeterStatus<T> = {
  state: T;
  states: T[];
  idx: number;
  waitingFor: Task<any>[];
  playing: boolean;
};

export type Meter<T> = Subscribable<MeterStatus<T>> & {
  actions: {
    pushStates: (...states: T[]) => void;
    waitFor: (task: Task<any>) => void;
    setPlay: (toggle: boolean | ((status: boolean) => boolean)) => void;
    setIdx: (idx: number | ((idx: number, length: number) => number)) => void;
    setHistory: (val: boolean) => void;
    reset: () => void;
  };
};

export const createMeter = <T>(
  initial: T,
  { history } = { history: false }
): Meter<T> => {
  let states = [initial];
  let idx = 0;
  let playing = true;
  let waitingFor: Task<any>[] = [];

  function getStatus(): MeterStatus<T> {
    return {
      state: states[idx],
      states,
      idx,
      playing,
      waitingFor,
    };
  }

  const { subscribe, get, next } = createSubscription<MeterStatus<T>>(
    getStatus()
  );

  function update() {
    next(getStatus());
  }

  function updateIdx(nextIdx: number) {
    idx = nextIdx;
    if (!history) {
      states = states.splice(idx);
      idx = 0;
    }
  }

  function iterate(): false | void {
    const isWaiting = waitingFor.length > 0;
    const isAtEnd = idx === states.length - 1;
    if (isWaiting || isAtEnd || !playing) {
      update();
      return;
    }
    updateIdx(idx + 1);
    update();
    asyncIterate();
  }

  function asyncIterate() {
    setTimeout(iterate, 0);
  }

  function clearWaiting() {
    if (waitingFor.length > 0) {
      waitingFor.forEach((task) => {
        task.finish();
      });
      waitingFor = [];
    }
  }
  return {
    subscribe,
    get,
    actions: {
      reset: () => {
        clearWaiting();
        states = [initial];
        updateIdx(0);
        update();
      },
      pushStates: (...incoming) => {
        states = [...states, ...incoming];
        asyncIterate();
      },
      setHistory: (val) => {
        history = val;
      },
      waitFor: (task) => {
        task.finished.then(() => {
          waitingFor = waitingFor.filter((x) => x !== task);
          iterate();
        });
        waitingFor = [...waitingFor, task];
        asyncIterate();
      },
      setPlay: (toggle) => {
        typeof toggle === "function"
          ? (playing = toggle(playing))
          : (playing = toggle);
        iterate();
      },
      setIdx: (input) => {
        const nextIdx =
          typeof input === "function" ? input(idx, states.length) : input;

        if (nextIdx > states.length - 1) return;

        playing = false;

        clearWaiting();

        updateIdx(nextIdx);
        update();
      },
    },
  };
};

export default createMeter;

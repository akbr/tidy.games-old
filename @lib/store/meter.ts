import type { Task } from "@lib/async/task";
import { createSubscription, Subscription } from "./subscription";

export type MeterStatus<T> = {
  state: T;
  states: T[];
  idx: number;
  waitingFor: Task<any>[];
  playing: boolean;
};

export type Meter<T> = Subscription<MeterStatus<T>> & {
  actions: {
    pushStates: (...states: T[]) => void;
    waitFor: (task: Task<any>) => void;
    setPlay: (toggle: boolean | ((status: boolean) => boolean)) => void;
    setIdx: (idx: number | ((idx: number, length: number) => number)) => void;
  };
};

export const createMeter = <T>(
  initial: T,
  { history } = { history: true }
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

  const subscribable = createSubscription<MeterStatus<T>>(getStatus());

  function update() {
    subscribable.next(getStatus());
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
    iterate();
  }

  return {
    ...subscribable,
    actions: {
      pushStates: (...incoming) => {
        states = [...states, ...incoming];
        iterate();
      },
      waitFor: (task) => {
        task.finished.then(() => {
          waitingFor = waitingFor.filter((x) => x !== task);
          iterate();
        });
        waitingFor = [...waitingFor, task];
        iterate();
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

        if (waitingFor.length > 0) {
          waitingFor.forEach((task) => {
            task.skip();
          });
          waitingFor = [];
        }

        updateIdx(nextIdx);
        update();
      },
    },
  };
};

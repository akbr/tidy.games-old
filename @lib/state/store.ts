import type { State, Setter, ActionCreator, ActionGlossary } from "./types";
import { createSubscription, Listener } from "./subscription";

export type Selector<T extends State, U> = (state: T) => U;

export interface StoreApi<T extends State> {
  get: () => T;
  set: Setter<T>;
  subscribe: (fn: Listener<T>) => () => void;
  subscribeWithSelector: <U>(
    selector: Selector<T, U>,
    listener: Listener<U>
  ) => () => void;
  createActions: <A extends ActionGlossary>(creator: ActionCreator<T, A>) => A;
}

export function partialShallowEqual(partial: State, full: State) {
  for (let key in partial) if (!(partial[key] === full[key])) return false;
  return true;
}

export const createStore = <T extends State>(initialValue: T): StoreApi<T> => {
  const [subscribe, update, get] = createSubscription<T>();
  update(initialValue);

  const set: Setter<T> = (partialUpdate) => {
    const currentState = get();
    if (partialShallowEqual(partialUpdate, currentState)) return false;
    let nextState = {
      ...currentState,
      ...partialUpdate,
    };
    update(nextState);
    return true;
  };

  return {
    get,
    set,
    subscribe,
    subscribeWithSelector: (selector, listener) =>
      subscribe((curr, prev) => {
        const currPartial = selector(curr);
        const prevPartial = selector(prev);
        if (currPartial !== prevPartial) {
          listener(currPartial, prevPartial);
        }
      }),
    createActions: (creator) => creator(set, get),
  };
};

export type Listener<T> = (curr: T, prev: T) => void;

export type Subscribe<T> = (listener: Listener<T>) => () => void;
export type Subscription<T> = {
  subscribe: Subscribe<T>;
  push: (nextState: T) => void;
  get: () => T;
};

export function createSubscription<T>(initialState: T): Subscription<T> {
  let currentState = initialState;
  let previousState = initialState;
  let listeners: Listener<T>[] = [];

  return {
    subscribe: (listener) => {
      listeners.push(listener);
      return () => (listeners = listeners.filter((x) => x !== listener));
    },
    push: (nextState: T) => {
      previousState = currentState;
      currentState = nextState;
      listeners.forEach((listener) => listener(currentState, previousState));
    },
    get: () => currentState,
  };
}

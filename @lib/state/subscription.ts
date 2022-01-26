export type Listener<T> = (curr: T, prev: T) => void;

export function createSubscription<T>() {
  let currentState: T;
  let previousState: T;

  let listeners: Listener<T>[] = [];

  return [
    (listener: Listener<T>) => {
      listeners.push(listener);
      return () => (listeners = listeners.filter((x) => x !== listener));
    },
    (next: T) => {
      previousState = currentState || next;
      currentState = next;
      listeners.forEach((listener) => listener(currentState, previousState));
    },
    () => currentState,
  ] as const;
}

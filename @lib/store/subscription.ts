import { shallow } from "@lib/compare/shallow";

export type Listener<T> = (curr: T, prev: T) => void;
export type Selector<T, U> = (curr: T) => U;

export interface Subscription<T> {
  subscribe: (listener: Listener<T>) => () => void;
  next: (state: T) => void;
  get: () => T;
}

export function createSubscription<T>(initial: T): Subscription<T> {
  const listeners: Set<Listener<T>> = new Set();
  let curr = initial;
  let prev = initial;

  return {
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    next: (state) => {
      prev = curr;
      curr = state;
      listeners.forEach((fn) => fn(curr, prev));
    },
    get: () => curr,
  };
}

export function withSelector<T, U>(
  { subscribe }: { subscribe: Subscription<T>["subscribe"] },
  selector: Selector<T, U>,
  listener: Listener<U>,
  isEqual = shallow
) {
  return subscribe((curr, prev) => {
    const selectedCurr = selector(curr);
    const selectedPrev = selector(prev);
    if (!isEqual(selectedCurr, selectedPrev))
      listener(selectedCurr, selectedPrev);
  });
}
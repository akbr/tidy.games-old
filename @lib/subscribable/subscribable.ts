import { shallow } from "@lib/compare/shallow";

export type Listener<T> = (curr: T, prev: T) => void;
export type Selector<T, U> = (curr: T) => U;

export interface Subscribable<T> {
  subscribe: (listener: Listener<T>) => () => void;
  next: (state: T) => void;
  get: () => T;
}

export function createSubscribable<T>(initial: T): Subscribable<T> {
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

export default createSubscribable;

export function createSet<T extends Object, U>(subscribable: Subscribable<T>) {
  return (partial: Partial<T>) => {
    subscribable.next({
      ...subscribable.get(),
      ...partial,
    });
  };
}

export function createActions<T extends Object, U>(
  subscribable: Subscribable<T>,
  fn: (set: (partial: Partial<T>) => void, get: () => T) => U
) {
  return fn(createSet(subscribable), subscribable.get);
}

export function withSelector<T, U>(
  { subscribe }: Omit<Subscribable<T>, "next">,
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

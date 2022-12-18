export type Listener<T> = (curr: T, prev: T) => void;

export interface ReadOnlyEmitter<T> {
  subscribe: (listener: Listener<T>) => () => void;
  get: () => T;
}

export interface Emitter<T> extends ReadOnlyEmitter<T> {
  next: (state: T) => void;
}

export function createEmitter<T>(initial: T): Emitter<T> {
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
export default createEmitter;

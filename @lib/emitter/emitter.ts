export type Listener<T> = (curr: T, prev: T) => void;

export interface ReadOnlyEmitter<T> {
  subscribe: (listener: Listener<T>) => () => void;
  get: () => T;
}

export type Options = {
  silent: boolean;
};

export const defaultOptions: Options = { silent: false };
export interface Emitter<T> extends ReadOnlyEmitter<T> {
  next: (state: T, options?: Options) => void;
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
    next: (state, { silent } = defaultOptions) => {
      prev = curr;
      curr = state;
      if (silent) return;
      listeners.forEach((fn) => fn(curr, prev));
    },
    get: () => curr,
  };
}
export default createEmitter;

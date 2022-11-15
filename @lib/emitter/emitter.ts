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
      curr = state;
      if (silent) return;
      listeners.forEach((fn) => fn(curr, prev));
      prev = curr;
    },
    get: () => curr,
  };
}

export function getReadOnlyEmitter<T>({
  get,
  subscribe,
}: Emitter<T>): ReadOnlyEmitter<T> {
  return { get, subscribe };
}

export default createEmitter;

export type Listener<T> = (curr: T, prev: T) => void;

export function createSubscription<T>() {
  let currentState: T;
  let previousState: T;
  let listeners: Listener<T>[] = [];

  function subscribe(listener: Listener<T>): () => void;
  function subscribe<SubState>(
    selector: (s: T) => SubState,
    listener: Listener<SubState>,
    comparator?: (curr: SubState, prev: SubState) => boolean
  ): () => void;

  function subscribe(...args: any) {
    const hasSelector = args.length > 1;
    const listener = hasSelector ? args[1] : args[0];

    if (hasSelector) {
      let [selector, , comparator] = args;
      comparator = comparator || ((x: unknown, y: unknown) => x === y);
      let firstRun = true;
      listeners.push((curr, prev) => {
        const modCurr = selector(curr);
        const modPrev = selector(prev);
        if (firstRun || !comparator(modCurr, modPrev))
          listener(modCurr, modPrev);
        firstRun = false;
      });
    } else {
      listeners.push(listener);
    }

    return () => (listeners = listeners.filter((x) => x !== listener));
  }

  return {
    subscribe,
    push: (nextState: T) => {
      previousState = currentState;
      currentState = nextState;
      listeners.forEach((listener) => listener(currentState, previousState));
    },
    get: () => currentState || undefined,
  };
}

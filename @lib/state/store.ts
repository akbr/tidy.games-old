export type State = object;

export interface Store<T extends State> {
  push: (state: T) => void;
  get: () => T;
  subscribe: {
    (listener: (state: T, prevState: T) => void): () => void;
    <U>(
      selector: (state: T) => U,
      listener: (selectedState: U, prevSelectedState: U) => void,
      equalityFn?: (a: U, b: U) => boolean
    ): () => void;
  };
}

const strictEqual = (x: any, y: any) => x === y;

export function createStore<T extends State>(initialState: T): Store<T> {
  let currentState = initialState;
  let prevState = initialState;
  let listeners: ((curr: T, prev: T) => void)[];

  const push = (pushedState: T) => {
    prevState = currentState;
    currentState = pushedState;
  };

  const subscribe = function (arg1, arg2, equalityFn = strictEqual) {
    if (!arg2) {
      let listener = arg1;
      listeners.push(listener);
    } else {
      let selector = arg1 as any;
      let listener = arg2 as any;
      listeners.push((curr, prev) => {
        let currTarget = selector(curr);
        let prevTarget = selector(prev);
        if (!equalityFn(currTarget, prevTarget)) {
          listener(currTarget, prevTarget);
        }
      });
    }
  } as Store<T>["subscribe"];

  return {
    get: () => initialState,
    push,
    subscribe,
  };
}

export type State = object;
export type StateSelector<T extends State, U> = (state: T) => U;
export type Listener<T> = (curr: T, prev: T) => void;
export type PartialState<
  T extends State,
  K1 extends keyof T = keyof T,
  K2 extends keyof T = K1,
  K3 extends keyof T = K2,
  K4 extends keyof T = K3
> =
  | (Pick<T, K1> | Pick<T, K2> | Pick<T, K3> | Pick<T, K4> | T)
  | ((state: T) => Pick<T, K1> | Pick<T, K2> | Pick<T, K3> | Pick<T, K4> | T);
export type SetState<T extends State> = {
  <
    K1 extends keyof T,
    K2 extends keyof T = K1,
    K3 extends keyof T = K2,
    K4 extends keyof T = K3
  >(
    partial: PartialState<T, K1, K2, K3, K4>
  ): void;
};

export type StoreApi<T extends State> = {
  get: {
    (): T;
    <U>(selector: (state: T) => U): U;
  };
  set: SetState<T>;
  subscribe: {
    <U>(
      selector: StateSelector<T, U>,
      fn: Listener<U>,
      equalityFn?: (curr: U, prev: U) => boolean
    ): () => void;
  };
};

export const createStore = <T extends State>(initialValue: T): StoreApi<T> => {
  let curr = initialValue;
  let prev = initialValue;
  let subscribers: Listener<T>[] = [];

  const update = () => {
    subscribers.forEach((fn) => fn(curr, prev));
  };

  function get(): T;
  function get<U>(selector: (state: T) => U): U;
  function get(selector?: Function) {
    return selector ? get(selector(curr)) : curr;
  }

  return {
    get,
    set: (partial) => {
      prev = curr;
      curr = {
        ...curr,
        ...partial,
      };
      update();
    },
    subscribe: (selector, fn, equalityFn) => {
      const test = equalityFn || ((a, b) => a === b);
      subscribers.push((curr, prev) => {
        const currPartial = selector(curr);
        const prevPartial = selector(prev);
        if (!test(currPartial, prevPartial)) {
          fn(currPartial, prevPartial);
        }
      });
      const thisFn = subscribers[subscribers.length - 1];
      return () => (subscribers = subscribers.filter((x) => x !== thisFn));
    },
  };
};

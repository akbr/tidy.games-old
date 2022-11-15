import { shallow } from "@lib/compare";
import createEmitter, {
  Emitter,
  ReadOnlyEmitter,
  Listener,
  Options,
} from "./emitter";

export type Selector<T, U> = (curr: T) => U;
export function withSelector<T, U>(
  { subscribe }: ReadOnlyEmitter<T>,
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

export function createSetFn<T>(emitter: Emitter<T>) {
  return (partial: Partial<T>, options?: Options) => {
    if (typeof partial === "object") {
      emitter.next(
        {
          ...emitter.get(),
          ...partial,
        },
        options
      );
    } else {
      emitter.next(partial, options);
    }
  };
}

export function createActions<T extends Object, U>(
  subscribable: Emitter<T>,
  fn: (set: (partial: Partial<T>) => void, get: () => T) => U
) {
  return fn(createSetFn(subscribable), subscribable.get);
}

export function makeAsync<T>(emitter: ReadOnlyEmitter<T>): ReadOnlyEmitter<T> {
  const history: T[] = [];
  let promise: any = null;

  const asyncEmitter = createEmitter(emitter.get());

  function iterate() {
    if (!promise && history.length > 0) {
      let state = history.shift()!;
      promise = Promise.resolve().then(() => {
        asyncEmitter.next(state);
        promise = null;
        iterate();
      });
    }
  }

  function next(curr: T) {
    history.push(curr);
    iterate();
  }

  emitter.subscribe(next);

  return asyncEmitter;
}

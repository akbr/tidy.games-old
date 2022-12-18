import { shallow } from "@lib/compare";
import { Emitter, ReadOnlyEmitter, Listener } from "./emitter";

export type Selector<T, U> = (curr: T) => U;
export function withSelector<T, U>(
  { subscribe }: ReadOnlyEmitter<T>,
  selector: Selector<T, U>,
  listener: Listener<U>,
  isEqual = shallow
) {
  let first = true;
  return subscribe((curr, prev) => {
    const selectedCurr = selector(curr);
    const selectedPrev = selector(prev);

    if (first || !isEqual(selectedCurr, selectedPrev)) {
      listener(selectedCurr, selectedPrev);
      first = false;
    }
  });
}

export function createSetFn<T>({ get, next }: Emitter<T>) {
  return (partial: Partial<T>) => {
    next({
      ...get(),
      ...partial,
    });
  };
}

import { useState, useLayoutEffect } from "preact/hooks";
import { shallow } from "@lib/compare";
import { ReadOnlyEmitter } from "./emitter";
import { withSelector, Selector } from "./utils";

export type UseEmitterHook<T> = {
  <U>(
    selector: Selector<T, U>,
    isEqual?: <T, U>(objA: T, objB: U) => boolean
  ): U;
  (): T;
};

export function createUseEmitter<T>(
  emitter: ReadOnlyEmitter<T>
): UseEmitterHook<T> {
  return function <U>(selector?: Selector<T, U>, isEqual = shallow) {
    const curr = emitter.get();
    const intial = selector ? selector(curr) : curr;
    const [state, setState] = useState(intial);

    useLayoutEffect(
      () =>
        selector
          ? withSelector(emitter, selector, setState, isEqual)
          : emitter.subscribe(setState),
      []
    );
    return state;
  };
}

export function useEmitter<T>(emitter: ReadOnlyEmitter<T>): T;
export function useEmitter<T, U>(
  emitter: ReadOnlyEmitter<T>,
  selector: Selector<T, U>,
  isEqual?: (objA: U, objB: U) => boolean
): U;

export function useEmitter(emitter: any, selector?: any, isEqual?: any): any {
  if (!selector) return createUseEmitter(emitter)();
  return createUseEmitter(emitter)(selector, isEqual);
}

export default useEmitter;

import { shallow } from "@lib/compare/shallow";
import { ReadOnlyEmitter } from "./emitter";
import { useState, useLayoutEffect } from "preact/hooks";
import { withSelector, Selector } from "./utils";

type UseEmitterHook<T> = {
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
    const [state, setState] = useState(selector ? selector(curr) : curr);
    useLayoutEffect(
      () =>
        selector
          ? withSelector(emitter, selector, setState, isEqual)
          : emitter.subscribe(setState),
      [selector, isEqual]
    );
    return state;
  };
}

export function useEmitter<T>(emitter: ReadOnlyEmitter<T>): T;
export function useEmitter<T, U>(
  emitter: ReadOnlyEmitter<T>,
  selector: Selector<T, U>,
  isEqual?: <T, U>(objA: T, objB: U) => boolean
): U;

export function useEmitter(emitter: any, selector?: any, isEqual?: any): any {
  if (!selector) return createUseEmitter(emitter)();
  return createUseEmitter(emitter)(selector, isEqual);
}

export default useEmitter;

import { shallow } from "@lib/compare/shallow";
import { Subscription, Selector, withSelector } from "./subscription";
import { useState, useLayoutEffect } from "preact/hooks";

export function useStore<T, U>(
  store: Subscription<T>,
  selector: Selector<T, U>,
  isEqual = shallow
) {
  const [state, setState] = useState(selector(store.get()));
  useLayoutEffect(
    () => withSelector(store, selector, setState, isEqual),
    [store, selector, isEqual]
  );
  return state;
}

export default useStore;

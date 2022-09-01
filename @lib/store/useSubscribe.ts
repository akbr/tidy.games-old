import { shallow } from "@lib/compare/shallow";
import { Subscribable, Selector, withSelector } from "./subscription";
import { useState, useLayoutEffect } from "preact/hooks";

export function useSubscribe<T, U>(
  sub: Subscribable<T>,
  selector: Selector<T, U>,
  isEqual = shallow
) {
  const [state, setState] = useState(selector(sub.get()));
  useLayoutEffect(
    () => withSelector(sub, selector, setState, isEqual),
    [sub, selector, isEqual]
  );
  return state;
}

export default useSubscribe;

import { shallow } from "@lib/compare/shallow";
import { Subscribable, Selector, withSelector } from "./subscribable";
import { useState, useLayoutEffect } from "preact/hooks";

export function useSubscribable<T, U>(
  sub: Omit<Subscribable<T>, "next">,
  selector: Selector<T, U>,
  isEqual = shallow
) {
  const [state, setState] = useState(selector(sub.get()));
  useLayoutEffect(() => withSelector(sub, selector, setState, isEqual), []);
  return state;
}

export default useSubscribable;

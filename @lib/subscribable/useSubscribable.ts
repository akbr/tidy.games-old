import { shallow } from "@lib/compare/shallow";
import { Subscribable, Selector, withSelector } from "./subscribable";
import { useState, useLayoutEffect } from "preact/hooks";

export function createUseSubscribable<T>(sub: Omit<Subscribable<T>, "next">) {
  return function <U>(selector: Selector<T, U>, isEqual = shallow) {
    const [state, setState] = useState(selector(sub.get()));
    useLayoutEffect(() => withSelector(sub, selector, setState, isEqual), []);
    return state;
  };
}

export function useSubscribable<T, U>(
  sub: Omit<Subscribable<T>, "next">,
  selector: Selector<T, U>,
  isEqual = shallow
) {
  return createUseSubscribable(sub)(selector, isEqual);
}

export default useSubscribable;

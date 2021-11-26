import {
  render as preactRender,
  h,
  ComponentChild,
  ComponentChildren,
  Ref,
  Fragment,
} from "preact";
import { useState, useEffect, useRef, useLayoutEffect } from "preact/hooks";
import { WaitRequest, debounce } from "@lib/timing";
import shallow from "zustand/shallow";

let waitRequests: WaitRequest[] = [];
export function render(
  component: ComponentChild,
  $rootEl: HTMLElement,
  waitFor: (...reqs: WaitRequest[]) => void
) {
  waitRequests = [];
  preactRender(component, $rootEl);
  let statuses = waitRequests.flat() as WaitRequest[];
  if (statuses.length) waitFor(...statuses);
}

export type Updater<T> = (
  $el: HTMLElement,
  props: T,
  prevProps?: T
) => WaitRequest | void;

export const WithUpdate = <T>({
  props,
  fn,
  children,
}: {
  props: T;
  fn: Updater<T>;
  children?: ComponentChildren;
}) => {
  //@ts-ignore
  let elRef: Ref<HTMLElement> = useRef();
  let propsRef: Ref<T> = useRef(null);
  let firstChild = children;

  if (Array.isArray(firstChild)) {
    throw new Error("WithUpdate only works on single children.");
  }

  //@ts-ignore
  if (!firstChild.ref) {
    //@ts-ignore
    firstChild.ref = elRef;
  }

  useLayoutEffect(() => {
    //@ts-ignore
    let $el = elRef.current.base ? elRef.current.base : elRef.current;
    //@ts-ignore
    if (!shallow(props, propsRef.current)) {
      //@ts-ignore
      let result = fn($el, props, propsRef.current);
      if (result) waitRequests.push(result);
      //@ts-ignore
      propsRef.current = props;
    }
    //@ts-ignore
  }, [elRef, fn, props]);

  return h(Fragment, null, children);
};

export function useOnResize<T>(fn: () => T) {
  const [value, set] = useState<T>(fn());
  useEffect(() => {
    const update = debounce(() => set(fn()), 300, false);
    return () => window.removeEventListener("resize", update);
  }, [fn]);
  return value;
}

export function useRefreshOnResize(debounceMs = 300) {
  const [_, set] = useState(Symbol());
  useEffect(() => {
    const update = debounce(() => set(Symbol()), debounceMs, false);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return _;
}

export function useWindowSize() {
  let [value, setValue] = useState([window.innerWidth, window.innerHeight]);

  useEffect(() => {
    const update = debounce(
      () => setValue([window.innerWidth, window.innerHeight]),
      300,
      false
    );

    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return value;
}

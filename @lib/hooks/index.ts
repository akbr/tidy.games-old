import { h, Fragment, ComponentChildren, RefObject } from "preact";
import { useState, useEffect, useRef, useLayoutEffect } from "preact/hooks";
import { debounce } from "@lib/async";
import { WaitFor, WaitRequest } from "@lib/state/meter";

export function useRefreshOnResize(debounceMs = 150) {
  const [_, set] = useState(Symbol());
  useEffect(() => {
    const update = debounce(() => set(Symbol()), debounceMs, false);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return _;
}
export const useRefresh = () => {
  const [_, set] = useState(Symbol());
  return () => set(Symbol());
};

export type DOMEffect<Props, El extends HTMLElement = HTMLElement> = (
  $el: El,
  curr: Props,
  prev?: Props
) => void | WaitRequest;

export function useDOMEffect<El extends HTMLElement, Props>(
  effectFn: DOMEffect<Props, El>,
  ref: RefObject<El>,
  props: Props,
  waitFor?: WaitFor
) {
  const propsRef = useRef<Props>();
  useLayoutEffect(() => {
    const prev = propsRef.current;
    propsRef.current = props;
    if (!ref.current) return;
    const waitReq = effectFn(ref.current, props, prev);
    if (waitFor) return waitFor(waitReq);
  });
}

export const RunDOMEffect = <T>({
  props,
  fn,
  children,
  waitFor,
}: {
  props: T;
  fn: DOMEffect<T>;
  children?: ComponentChildren;
  waitFor?: WaitFor;
}) => {
  const elRef: RefObject<HTMLElement> = useRef(null);

  if (Array.isArray(children)) {
    throw new Error("WithUpdate only works on single children.");
  }

  //@ts-ignore
  children.ref = elRef;

  useDOMEffect(fn, elRef, props, waitFor);

  return h(Fragment, null, children);
};

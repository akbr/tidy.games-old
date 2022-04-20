import { h, Fragment, ComponentChildren, RefObject } from "preact";
import { useRef, useLayoutEffect } from "preact/hooks";
import { WaitFor, WaitRequest } from "@lib/state/meter";

export type DOMEffect<
  Props = undefined,
  El extends HTMLElement = HTMLElement
> = ($el: El, curr: Props, prev?: Props) => void | WaitRequest;

export function useDOMEffect<El extends HTMLElement, Props>(
  effectFn: DOMEffect<Props, El>,
  ref: RefObject<El>,
  props: Props,
  once?: boolean,
  waitFor?: WaitFor
) {
  const propsRef = useRef<Props>();

  useLayoutEffect(
    () => {
      const prev = propsRef.current;
      propsRef.current = props;
      if (!ref.current) return;
      const waitReq = effectFn(ref.current, props, prev);
      if (waitFor) return waitFor(waitReq);
    },
    once ? [] : undefined
  );
}

export const RunDOMEffect = <T>({
  props,
  fn,
  children,
  waitFor,
  once,
}: {
  props: T;
  fn: DOMEffect<T>;
  children?: ComponentChildren;
  waitFor?: WaitFor;
  once?: boolean;
}) => {
  //@ts-ignore
  const preexistingRef = children.ref as RefObject<HTMLElement>;
  const elRef: RefObject<HTMLElement> = preexistingRef || useRef(null);

  if (Array.isArray(children)) {
    throw new Error("WithUpdate only works on single children.");
  }

  //@ts-ignore
  children.ref = elRef;

  useDOMEffect(fn, elRef, props, once, waitFor);

  return h(Fragment, null, children);
};

import { RefObject } from "preact";
import { useState, useEffect, useRef, useLayoutEffect } from "preact/hooks";
import { debounce, Task } from "@lib/async";
import { WaitFor } from "@lib/state/meter";

export function useRefreshOnResize(debounceMs = 300) {
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

type EffectFn<El extends HTMLElement, Props> = (
  $el: El,
  curr: Props,
  prev?: Props
) => void | Task;

export function useGameEffect<El extends HTMLElement, Props>(
  effectFn: EffectFn<El, Props>,
  ref: RefObject<El>,
  props: Props,
  waitFor?: WaitFor
) {
  const propsRef = useRef<Props>();
  useLayoutEffect(() => {
    const prev = propsRef.current;
    propsRef.current = props;
    if (!ref.current) return;
    if (waitFor) return waitFor(effectFn(ref.current, props, prev));
    effectFn(ref.current, props, prev);
  });
}

import { useLayoutEffect, MutableRef } from "preact/hooks";
import { receive } from "@lib/globalUi";
import { Task } from "@lib/async/task";

export type DOMEffect<T, E = HTMLElement> = (
  $el: E,
  props: T
) => Task<any> | void;

export function useDOMEffect<T, E = HTMLElement>(
  fn: DOMEffect<T, E>,
  ref: MutableRef<E | null>,
  props: T
) {
  useLayoutEffect(() => {
    if (!ref.current) return;
    const result = fn(ref.current, props);
    if (result) receive(result);
  }, [fn, ref, props]);
}

export default useDOMEffect;

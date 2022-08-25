import { useLayoutEffect, MutableRef } from "preact/hooks";
import { Task } from "@lib/async/task";

type Receiver = (task: Task<any>) => void;
let receiver: null | Receiver = null;

export const setReceiver = (fn: Receiver) => {
  receiver = fn;
};

type DOMEffect<T, E = HTMLElement> = ($el: E, props: T) => Task<any> | void;

export function useDOMEffect<T, E = HTMLElement>(
  fn: DOMEffect<T, E>,
  ref: MutableRef<E | null>,
  props: T
) {
  useLayoutEffect(() => {
    if (!ref.current) return;
    const result = fn(ref.current, props);
    if (result && receiver) receiver(result);
  }, [fn, ref, props]);
}

export default useDOMEffect;

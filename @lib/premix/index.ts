import {
  render as preactRender,
  h,
  ComponentChild,
  ComponentChildren,
  Ref,
  Fragment,
} from "preact";
import { useState, useEffect, useRef, useLayoutEffect } from "preact/hooks";
import { WaitRequest } from "../timing";

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
  props?: T;
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
    let result = fn($el, props, propsRef.current);
    if (result) waitRequests.push(result);
    //@ts-ignore
    propsRef.current = props;
  }, [elRef, fn, props]);

  return h(Fragment, null, children);
};

function debounce(func: Function, wait: number, immediate: boolean) {
  var timeout: number | undefined;
  return function () {
    //@ts-ignore
    var context = this,
      args = arguments;
    var later = function () {
      timeout = undefined;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    //@ts-ignore
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
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

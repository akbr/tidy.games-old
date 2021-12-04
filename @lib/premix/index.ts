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

export const spec =
  (node: any) =>
  ({
    children,
    ...props
  }: h.JSX.HTMLAttributes<EventTarget> &
    h.JSX.SVGAttributes<SVGElement> &
    Record<string, any> & { children?: ComponentChildren }) => {
    let modClass: string | null = null;
    if (props.class || props.className) {
      modClass = node.props.class || node.props.className || "";
      if (props.class) modClass += ` ${props.class}`;
      if (props.className) modClass += ` ${props.className}`;
    }
    let modProps = {
      ...node.props,
      ...props,
      class: modClass
        ? modClass
        : node.props.class
        ? node.props.class
        : node.props.className,
    };
    return h(node.type, modProps, children || node.props.children);
  };

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
      if (result) {
        waitRequests.push(result);
      }
      //@ts-ignore
      propsRef.current = props;
    }
  }, [elRef, fn, props]);

  return h(Fragment, null, children);
};

export function useRefreshOnResize(debounceMs = 300) {
  const [_, set] = useState(Symbol());
  useEffect(() => {
    const update = debounce(() => set(Symbol()), debounceMs, false);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return _;
}

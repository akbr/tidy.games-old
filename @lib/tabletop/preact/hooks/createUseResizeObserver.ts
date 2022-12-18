import { useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";
import { debounce } from "@lib/async";

export const getElDimensions = ($el: HTMLElement) => {
  const { width, height, x, y } = $el.getBoundingClientRect();
  return {
    width,
    height,
    x,
    y,
    resizeSymbol: Symbol(),
  };
};

export const createUseResizeObserver = ($el: HTMLElement) => () => {
  const initialValue = useMemo(() => {
    return getElDimensions($el);
  }, []);

  const [rect, setRect] = useState(initialValue);
  let observer = useRef<ResizeObserver | null>(null);

  useLayoutEffect(() => {
    const update = debounce(() => setRect(getElDimensions($el)), 200, false);
    observer.current = new ResizeObserver(update);
    observer.current.observe($el);
    return () => observer.current?.disconnect();
  }, [$el]);

  return rect;
};

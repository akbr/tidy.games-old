import "@shared/base.css";
import { render } from "preact";
import { useLayoutEffect, useRef } from "preact/hooks";
import { style } from "@lib/style";

function App() {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const $el = ref.current!;
    style($el, [{ x: 0 }, { x: 100, rotate: 90 }, { x: 50 }], {
      duration: 1000,
    });
  }, []);
  return <div ref={ref} class="absolute w-5 h-5 bg-slate-500"></div>;
}

render(<App />, document.body);

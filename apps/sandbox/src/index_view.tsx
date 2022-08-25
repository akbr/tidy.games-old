import "@shared/base.css";
import { render } from "preact";
import { useRef } from "preact/hooks";
import { createMeter } from "@lib/store/meter";
import { MeterDev } from "@lib/store/MeterDev";
import { useStore } from "@lib/store";
import { setReceiver, useDOMEffect } from "@lib/hooks/useDOMEffect";
import { style } from "@lib/stylus";

const meter = createMeter(Date.now(), { history: true });

function fadeInValue($el: HTMLDivElement, value: string | number) {
  $el.innerHTML = String(value) + "!";
  return style(
    $el,
    [
      { opacity: 0, x: () => Math.random() * 100 },
      { opacity: 1, x: 0 },
    ],
    { duration: 1000 }
  );
}

const Display = () => {
  const timestamp = useStore(meter, (m) => m.state);
  const timestampRef = useRef(null);
  useDOMEffect(fadeInValue, timestampRef, timestamp);

  return (
    <div class="w-full bg-purple-400">
      <div ref={timestampRef} />
      <button onClick={() => meter.actions.pushStates(Date.now())}>next</button>
    </div>
  );
};

setReceiver(meter.actions.waitFor);

render(
  <MeterDev meter={meter}>
    <Display />
  </MeterDev>,
  document.body
);

import "@shared/base.css";
import { render } from "preact";
import { createMeter } from "@lib/meter";
import { DevWrapper } from "@lib/meter/preact";
import createEmitter, { useEmitter } from "@lib/emitter";
import { delay } from "@lib/async/task";
import { useLayoutEffect } from "preact/hooks";
//import { App } from "./App";
//render(<App />, document.body);

const meter = createMeter(0, { history: true });

const App = () => {
  const n = useEmitter(meter.emitter, (x) => x.state);
  useLayoutEffect(() => {
    meter.waitFor(delay(1000));
  });
  return <div>Hello, world! {n}</div>;
};

render(
  <DevWrapper meter={meter} stateDisplay={(x) => <div>{x.curr}</div>}>
    <App />
  </DevWrapper>,
  document.body
);

meter.pushStates(1, 2, 3, 4, 5);

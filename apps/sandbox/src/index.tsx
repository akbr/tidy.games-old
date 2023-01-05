import "@shared/base.css";

import { render } from "preact";
import { Backdrop } from "@lib/tabletop/preact/views/Backdrop";
import Card from "@shared/components/Card";
import { HandController } from "@shared/components/HandController";
import { useState } from "preact/hooks";

const hand = ["2|s", "3|h", "4|c"];

function App() {
  const [err, setErr] = useState<any>(undefined);
  return (
    <Backdrop>
      <div class="absolute top-0 right-0">
        <button
          onClick={() => {
            setErr(Math.random());
          }}
        >
          Reset
        </button>
      </div>
      <HandController hand={hand} errRef={err}>
        {hand.map((card) => (
          <Card card={card} />
        ))}
      </HandController>
    </Backdrop>
  );
}
render(<App />, document.body);

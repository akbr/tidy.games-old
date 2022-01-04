import type { CreateEngineTypes, GetInitialState, Chart } from "@lib/engine";
import { createMachine } from "@lib/engine";
import { engine } from "./engine";

import { expect } from "chai";

const res = createMachine(engine, { numPlayers: 2 }, { seed: "test" });

if (res.type === "success") {
  let machine = res.data;
  console.log(machine.submit({ type: "bid", data: 1, player: 1 }));
  console.log(machine.getStream());
  console.log(machine.submit({ type: "bid", data: 1, player: 0 }));
  console.log(machine.getStream());
}

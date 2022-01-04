import { createMachine } from "@lib/engine";
import { engine } from "./engine";

import { expect } from "chai";

const res = createMachine(engine, { numPlayers: 2 }, { seed: "test" });

if (res.type === "success") {
  let { submit, getStream, getState } = res.data;
  submit({ type: "bid", data: 1 }, 1);
  submit({ type: "bid", data: 1 }, 0);
  submit({ type: "play", data: "8|c" }, 1);
  submit({ type: "play", data: "13|c" }, 0);
  console.log(getState());
} else if (res.type === "err") {
  console.log(res);
}

import { createMachine } from "@lib/engine";
import { engine } from "./engine";

const machineRes = createMachine(engine, { numPlayers: 2 }, { seed: "test" });

if (machineRes.type === "success") {
  let { submit, getUpdate, getState } = machineRes.data;
  let res = submit({ type: "bid", data: 1 }, 1);
  res = submit({ type: "bid", data: 1 }, 0);
  res = submit({ type: "play", data: "8|c" }, 1);
  res = submit({ type: "play", data: "13|c" }, 0);
} else if (machineRes.type === "err") {
  console.log(machineRes);
}

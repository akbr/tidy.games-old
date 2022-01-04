//@ts-nocheck

import type { CreateEngineTypes, GetInitialState, Chart } from "@lib/engine";
import { createMachine, getLastState } from "@lib/engine";
import { engine } from "./engine";

import { expect } from "chai";

const machine = createMachine(engine);
machine.init({ numPlayers: 2 }, { seed: "test" });

let res = machine.get();
let state = getLastState(res.data);
expect(res.data.length).to.equal(3);
expect(state.type).to.equal("bid");

res = machine.submit({ type: "bid", data: 1, player: 1 });
state = getLastState(res.data);
expect(res.data.length).to.equal(2);
expect(state.type).to.equal("bid");

res = machine.submit({ type: "bid", data: 1, player: 0 });
state = getLastState(res.data);
expect(res.data.length).to.equal(3);
expect(state.type).to.equal("play");
expect(state.data.player).to.equal(1);

res = machine.submit({ type: "play", data: "8|c", player: 1 });
state = getLastState(res.data);
expect(res.data.length).to.equal(2);
expect(state.type).to.equal("play");

res = machine.submit({ type: "play", data: "13|c", player: 0 });
state = getLastState(res.data);
expect(res.data.length).to.equal(5);
expect(state.type).to.equal("bid");
console.log(JSON.stringify(res.data[3]));

import { lastOf } from "@lib/array";
import {
  CreateEngineTypes,
  Chart,
  GetInitialState,
  isErr,
  createMachineFactory,
  createGame,
  getStateActionList,
  Bot,
} from "@lib/engine-turn";

type AddGameTypes = CreateEngineTypes<{
  states: { type: "playing"; data: number } | { type: "end" };
  actions: { type: "add"; data: number } | { type: "sub"; data: number };
  options: { maxNum: number };
}>;

const chart: Chart<AddGameTypes> = {
  playing: ({ data: currentCount }, { options: { maxNum } }, action) => {
    if (currentCount >= maxNum) return { type: "end" };
    if (action) {
      const { type, data: num } = action;
      const newCount = type === "add" ? currentCount + num : currentCount - num;
      return { type: "playing", data: newCount };
    }
    return null;
  },
  end: (state, _, action) => null,
};

const getInitialState: GetInitialState<AddGameTypes> = () => ({
  type: "playing",
  data: 0,
});

const createMachine = createMachineFactory({
  chart,
  getInitialState,
  getDefaultOptions: () => ({ maxNum: 10 }),
});

const til9: Bot<AddGameTypes> = (segment, player) => {
  if (isErr(segment)) return;
  const state = lastOf(segment.states);
  if (state.type === "playing" && state.data < 11) {
    return { type: "add", data: 2 };
  }
};

const machine = createMachine({ ctx: { numPlayers: 2 } });

if (typeof machine !== "string") {
  const r = machine.getRecord();

  const game = createGame(machine);
  game.setPlayerFn(0, til9);
  game.setPlayerFn(1, (segment) => {});
  getStateActionList(chart, machine.getRecord())
    .map(([type, thing]) => {
      if (type === "action") {
        return `Player ${thing.player} ${thing.type}'ed ${thing.data}!`;
      } else {
        if (thing.type === "playing")
          return `The total is now ${thing.data}. Waiting for next move...`;
        return `The game has ended.`;
      }
    })
    .forEach((x) => console.log(x));
}

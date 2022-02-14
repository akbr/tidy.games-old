import { lastOf } from "@lib/array";
import { createGame } from "@lib/tabletop";
import { createMachine } from "@lib/tabletop";
import { getFrames, createActionFns } from "@lib/tabletop/utils";
import { getStatuses } from "@lib/tabletop/machine";
import { wizardDefinition, WizardSpec } from "./game";

const machine = createMachine(wizardDefinition, {
  ctx: {
    numPlayers: 2,
    seed: "test",
    options: null,
  },
});

if (typeof machine === "string") throw new Error("Machine creation error.");

const game = createGame(machine);

const a = createActionFns<WizardSpec>(
  {
    select: (i) => i,
    bid: (i) => parseInt(i, 10),
    play: (i) => i,
  },
  game.submit
);

game.setPlayerFn(-1, (step) => {
  console.log("step:", step);
  if (typeof step !== "string") {
    getFrames(step).forEach((frame) => {
      console.log("frame:", frame.gameState, frame.action !== null);
    });
  }
});

a.bid(1, "1");
a.bid(0, "1");

/**
const bot = wrapStateBot<WizardSpec>(([state, game], player) => {
  if (game.player !== player) return;
  if (state === "bid") return { type: "bid", data: 0 };
}, game.submit);

game.setPlayerFn(1, bot);
game.setPlayerFn(2, bot);
 */

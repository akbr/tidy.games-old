import { lastOf } from "@lib/array";
import { createGame } from "@lib/tabletop";
import { createMachine } from "@lib/tabletop";
import { getFrames, getCurrentGame } from "@lib/tabletop/utils";
import { wizardDefinition } from "./game";

const machine = createMachine(wizardDefinition, {
  numPlayers: 2,
  seed: "test",
  options: null,
});

if (typeof machine === "string") throw new Error("Machine creation error.");

const game = createGame(machine);

game.setPlayerFn(0, (status) => {
  if (typeof status !== "string") {
    console.log(status);
    getFrames(status, true).forEach((frame) => {
      console.log(frame.gameState);
    });
  }
});

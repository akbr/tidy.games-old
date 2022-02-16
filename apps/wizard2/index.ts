import { lastOf } from "@lib/array";
import { createGame, GameDefinition, Spec } from "@lib/tabletop";
import { createMachine } from "@lib/tabletop";
import { getFrames, createActionFns } from "@lib/tabletop/utils";
import { getStatuses } from "@lib/tabletop/machine";
import { wizardDefinition, WizardSpec } from "./game";
import { Ctx } from "@lib/tabletop/types";

function make<S extends Spec>(
  def: GameDefinition<S>,
  { ctx }: { ctx: Ctx<S> }
) {
  const machine = createMachine(def, { ctx });
  if (typeof machine === "string") {
    throw new Error("Machine creation error.");
  }
  const game = createGame(machine);
  const actions = createActionFns(def.actionStubs, game.submit);
  return { machine, game, actions };
}

const { machine, game, actions } = make(wizardDefinition, {
  ctx: {
    numPlayers: 2,
    seed: "test",
    options: null,
  },
});

game.setPlayerFn(-1, (step) => {
  const frames = getFrames(step);
  frames.forEach((frame, idx) => {
    console.log(
      "frame:",
      frame.gameState,
      frame.action !== null ? "<--- ACTION" : ""
    );
  });
});
actions.bid(1, "1");
actions.bid(0, "1");
actions.play(1, "6|h");
actions.play(0, "11|h");

console.log(machine.export());

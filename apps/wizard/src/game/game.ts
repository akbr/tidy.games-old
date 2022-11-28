import type { Game } from "@lib/tabletop";

import { WizardSpec } from "./spec";
import { wizardReducer, getNextRound } from "./reducer";
import { wizardBotFn } from "./botFn";

export const wizardGame: Game<WizardSpec> = {
  meta: {
    name: "Wizard",
    players: [2, 6],
  },
  getOptions: (
    numPlayers,
    options = { canadian: true, numRounds: 60 / numPlayers }
  ) => {
    const maxRounds = 60 / numPlayers;
    const numRounds =
      options.numRounds > maxRounds ? maxRounds : options.numRounds;

    return {
      ...options,
      numRounds,
    };
  },
  getInitialBoard: getNextRound,
  reducer: wizardReducer,
  actionKeys: {
    bid: null,
    play: null,
    select: null,
  },
  maskPatch: (patch, playerIndex) => {
    if (patch.hands) {
      return {
        hands: patch.hands.map((hand, idx) =>
          idx === playerIndex ? hand : []
        ),
      };
    }
  },
  botFn: wizardBotFn,
};
export default wizardGame;

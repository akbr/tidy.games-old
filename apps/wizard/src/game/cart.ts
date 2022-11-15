import type { Cart } from "@lib/tabletop";

import { WizardSpec } from "./spec";
import { wizardChart, getNextRound } from "./chart";
import { wizardBotFn } from "./botFn";

export const wizardCart: Cart<WizardSpec> = {
  meta: {
    name: "Wizard",
    players: [2, 6],
  },
  getNumPlayers: (num) => {
    const [min, max] = wizardCart.meta.players;
    if (num === undefined) return 2;
    if (num < min) return min;
    if (num > max) return max;
    return num;
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
  getInitialGame: getNextRound,
  chart: wizardChart,
  actionKeys: {
    bid: null,
    play: null,
    select: null,
  },
  adjustGame: (g, player) => ({
    ...g,
    hands: g.hands.map((hand, idx) => (idx === player ? hand : [])),
  }),
  botFn: wizardBotFn,
};
export default wizardCart;

import type { Cart } from "@lib/tabletop";

import { WizardSpec } from "./spec";
import { wizardChart, getNextRound } from "./chart";
import { wizardBotFn } from "./botFn";

export const wizardCart: Cart<WizardSpec> = {
  meta: {
    name: "Wizard",
    players: [2, 6],
  },
  setOptions: (
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
  setup: (ctx) => {
    const validNumPlayers = ctx.numPlayers >= 2 && ctx.numPlayers <= 6;
    return validNumPlayers ? getNextRound(ctx) : "Invalid number of players.";
  },
  chart: wizardChart,
  actionStubs: {
    bid: null,
    play: null,
    select: null,
  },
  stripGame: ([, game], player) => {
    if (!game.hands) return game;
    return {
      ...game,
      hands: game.hands.map((hand, idx) => (idx === player ? hand : [])),
    };
  },
  botFn: wizardBotFn,
};
export default wizardCart;

import type { Cart } from "@lib/tabletop";

import { CondottiereSpec } from "./spec";
import { condottiereChart, nextRound } from "./chart";
import { is } from "@lib/compare/is";

export const condottiereCart: Cart<CondottiereSpec> = {
  meta: {
    name: "Condottiere",
    players: [2, 6],
  },
  setup: (ctx) => {
    const validNumPlayers = ctx.numPlayers >= 2 && ctx.numPlayers <= 6;
    return validNumPlayers ? nextRound(ctx) : "Invalid number of players.";
  },
  setOptions: () => null,
  chart: condottiereChart,
  stripGame: ([type, game], player) => {
    if (game.hands) {
      game = {
        ...game,
        hands: game.hands.map((hand, idx) => (idx === player ? hand : [])),
      };
    }

    const { discardResults } = game;
    if (discardResults) {
      const resultsPending =
        discardResults.length > 0 &&
        is.defined(discardResults.find((x) => x === null));
      if (resultsPending) {
        game = { ...game, discardResults: [] };
      }
    }

    return game;
  },
  actionStubs: {
    choose: null,
    play: null,
    retreat: null,
    discard: null,
  },
};
export default condottiereCart;

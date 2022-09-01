import type { Cart } from "@lib/tabletop";

import { CondottiereSpec } from "./spec";
import { condottiereChart, nextRound } from "./chart";
import { condottiereBotFn } from "./botFn";
import { is } from "@lib/compare/is";

export const condottiereCart: Cart<CondottiereSpec> = {
  meta: {
    name: "Condottiere",
    players: [2, 6],
  },
  getInitialState: (ctx) => {
    const players = condottiereCart.meta.players;
    const validNumPlayers =
      ctx.numPlayers >= players[0] && ctx.numPlayers <= players[1];
    return validNumPlayers ? nextRound(ctx) : "Invalid number of players.";
  },
  getOptions: () => null,
  chart: condottiereChart,
  adjustState: (patch, player) => {
    let nextpatch: Partial<CondottiereSpec["game"]> = {};

    const { hands, discardResults } = patch;

    if (hands) {
      nextpatch.hands = hands.map((hand, idx) => (idx === player ? hand : []));
    }

    if (discardResults) {
      const resultsPending =
        discardResults.length > 0 &&
        is.defined(discardResults.find((x) => x === null));
      if (resultsPending) {
        nextpatch.discardResults = [];
      }
    }

    return nextpatch;
  },
  actionKeys: {
    choose: null,
    play: null,
    retreat: null,
    discard: null,
  },
  botFn: condottiereBotFn,
};

export default condottiereCart;

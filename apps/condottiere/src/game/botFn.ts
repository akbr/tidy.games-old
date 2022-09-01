import type { BotFn } from "@lib/tabletop/";
import type { CondottiereSpec } from "./spec";
import { Cities } from "./glossary";

import { randomFromArray, randomBetween } from "@lib/random";

export const condottiereBotFn: BotFn<CondottiereSpec> = (
  state,
  ctx,
  player
) => {
  if (state.phase === "discard") {
    return { type: "discard", data: false };
  }

  const isMyTurn = player === state.player;
  if (!isMyTurn) return;

  const seed = ctx.seed + player + state.round;

  if (state.phase === "choose") {
    const validCities = Object.entries(state.map)
      .map(([id, val]) => (val === null ? id : false))
      .filter((x) => x) as Cities[];
    return { type: "choose", data: randomFromArray(validCities, seed) };
  }

  if (state.phase === "play") {
    const num = randomBetween(0, 1, seed);
    if (num > 0) {
      return {
        type: "play",
        data: randomFromArray(state.hands[player], seed),
      };
    } else {
      return { type: "play", data: false };
    }
  }

  if (state.phase === "retreat") {
    return { type: "retreat", data: false };
  }
};

import type { BotFn } from "@lib/tabletop/";
import type { WizardSpec } from "./spec";

import { checkBid, getPlayableCards } from "./logic";
import { randomFromArray } from "@lib/random";

export const wizardBotFn: BotFn<WizardSpec> = (state, ctx, player) => {
  const isMyTurn = player === state.player;
  if (!isMyTurn) return;

  if (state.phase === "select") {
    return { type: "select", data: randomFromArray(["c", "d", "h", "s"]) };
  }

  if (state.phase === "bid") {
    const lowestPossibleBid = !!checkBid(0, state, ctx.options) ? 1 : 0;
    return { type: "bid", data: lowestPossibleBid };
  }

  if (state.phase === "play") {
    const playable = getPlayableCards(state.hands[player], state.trick);
    return { type: "play", data: randomFromArray(playable) };
  }
};

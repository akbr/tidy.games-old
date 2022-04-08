import type { BotFn } from "@lib/tabletop/cart";
import type { WizardSpec } from "./spec";

import { checkBid, getPlayableCards } from "./logic";
import { randomFromArray } from "@lib/random";

export const wizardBotFn: BotFn<WizardSpec> = (
  { state: [type, game], player, ctx },
  send
) => {
  const isMyTurn = player === game.player;

  if (!isMyTurn) return;

  if (type === "select") {
    send({ type: "select", data: randomFromArray(["c", "d", "h", "s"]) });
  }

  if (type === "bid") {
    const lowestPossibleBid = !!checkBid(0, game, ctx.options) ? 1 : 0;
    send({ type: "bid", data: lowestPossibleBid });
  }

  if (type === "play") {
    const playable = getPlayableCards(game.hands[player], game.trick);
    send({ type: "play", data: randomFromArray(playable) });
  }
};

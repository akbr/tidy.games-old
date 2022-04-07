import { WizardSpec } from "./spec";
import { BotFn } from "@lib/tabletop/cart";
import { checkBid, getPlayableCards } from "./logic";

export const wizardBotFn: BotFn<WizardSpec> = (
  { state: [type, game], player, ctx },
  send
) => {
  if (player !== game.player) return;
  if (type === "select") send({ type: "select", data: "h" });
  if (type === "bid") {
    return !!checkBid(0, game, ctx.options)
      ? send({ type: "bid", data: 1 })
      : send({ type: "bid", data: 0 });
  }
  if (type === "play") {
    const [card] = getPlayableCards(game.hands[player], game.trick);
    send({ type: "play", data: card });
  }
};

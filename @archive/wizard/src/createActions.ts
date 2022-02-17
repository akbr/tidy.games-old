import { AppPrimitives } from "@lib/client-setup/";
import { WizardShape } from "./engine/types";

export const createActions = (api: AppPrimitives<WizardShape>) => {
  const { send } = api.manager;

  return {
    bid: (num: number) => send(["engine", { type: "bid", data: num }]),
    selectTrump: (suit: string) =>
      send(["engine", { type: "selectTrump", data: suit }]),
    play: (cardId: string) => send(["engine", { type: "play", data: cardId }]),
  };
};

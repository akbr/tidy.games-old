import { AppPrimitives } from "@lib/client-setup/";
import { WizardShape } from "./engine/types";

import {
  createServerActions,
  createDialogActions,
} from "@lib/client-setup/storeSlices";

export type Actions = ReturnType<typeof createActions>;

export const createActions = (api: AppPrimitives<WizardShape>) => {
  const { send } = api.manager;

  const stock = {
    waitFor: api.meter.waitFor,
    ...createServerActions(api),
    ...createDialogActions(api),
  };

  return {
    ...stock,
    bid: (num: number) => send(["engine", { type: "bid", data: num }]),
    selectTrump: (suit: string) =>
      send(["engine", { type: "selectTrump", data: suit }]),
    play: (cardId: string) => send(["engine", { type: "play", data: cardId }]),
  };
};

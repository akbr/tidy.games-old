import { AppPrimitives } from "@lib/socket-server-interface/types";
import { WizardShape } from "./engine/types";
import { StoreShape } from "./types";

export type Actions = ReturnType<typeof createActions>;

export const createActions = ({
  store,
  manager,
  meter,
}: AppPrimitives<WizardShape, StoreShape>) => {
  const { send } = manager;
  const { waitFor } = meter;

  return {
    join: (id?: string) => {
      //@ts-ignore
      send(["server", { type: "join", data: { id } }]);
    },
    start: () => send(["server", { type: "start" }]),
    addBot: () => send(["server", { type: "addBot" }]),
    bid: (num: number) => send(["engine", { type: "bid", data: num }]),
    selectTrump: (suit: string) =>
      send(["engine", { type: "selectTrump", data: suit }]),
    play: (cardId: string) => send(["engine", { type: "play", data: cardId }]),
    exit: () => {
      store.setState({ state: null, room: null });
      manager.openSocket();
    },
    setDialog: (dialog: StoreShape["dialog"]) => {
      store.setState({ dialog });
    },
    waitFor,
  };
};

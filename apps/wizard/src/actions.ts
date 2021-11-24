import { AppInterface } from "@lib/socket-server-interface/types";

import { WizardShape } from "./engine/types";
import { engine } from "./engine";

export type Actions = ReturnType<typeof createActions>;

export const createActions = ({
  store,
  manager,
  meter,
}: AppInterface<WizardShape>) => {
  const { send } = manager;
  const { getState, setState } = store;
  const { waitFor } = meter;

  const getScreenDimensions = (inputWidth: number, inputHeight: number) => ({
    w: inputWidth > 700 ? 700 : inputWidth,
    h: inputHeight,
  });

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
    isInHand: (cardId = "") => {
      let { room, state } = getState();
      if (!room || !state) return false;
      return state.hands[room.seatIndex].includes(cardId);
    },
    isValidPlay: (cardId: string) => {
      let { state, room } = getState();
      if (!room || !state || !engine.isState(state)) return false;
      let nextState = engine.reducer(
        state,
        { numSeats: room.seats.length },
        {
          action: { type: "play", data: cardId },
          seatIndex: room.seatIndex,
        }
      );
      if (nextState.type === "err") {
        setState({ err: nextState });
        return false;
      } else {
        return true;
      }
    },
    exit: () => {
      store.setState({ state: null, room: null });
      manager.openSocket();
    },
    waitFor,
  };
};

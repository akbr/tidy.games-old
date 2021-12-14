import type { WizardEngine, WizardShape } from "./types";
import { createReducer } from "@lib/fsm";
import { toDeal, reducerFns } from "./reducerFns";
import { createBot } from "./createBot";

export const engine: WizardEngine = {
  shouldAddSeat: (numSeats, gameStarted) => numSeats < 6 && !gameStarted,
  shouldStart: (numSeats) => numSeats >= 2,
  getInitialState: (numPlayers, options) => toDeal({ numPlayers, options }),
  reducer: createReducer(reducerFns),
  isMsg: (x) => x.type === "err",
  adapt: (s, seatIndex) => {
    return {
      type: s.type,
      data: {
        ...s.data,
        hands: s.data.hands.map((hand, idx) => (idx === seatIndex ? hand : [])),
      },
    } as WizardShape["states"];
  },
  createBot,
};

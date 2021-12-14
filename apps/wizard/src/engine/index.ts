import type { WizardEngine, WizardShape } from "./types";
import { createReducer } from "@lib/io/reducer";
import { toDeal, reducerFns } from "./reducerFns";
import { createBot } from "./createBot";

export const engine: WizardEngine = {
  shouldAddSeat: (numSeats, gameStarted) => numSeats < 6 && !gameStarted,
  shouldStart: (numSeats) => numSeats >= 2,
  getInitialState: (numPlayers) => toDeal({ numPlayers }),
  reducer: createReducer(reducerFns),
  isMsg: (s) => s.type === "err",
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

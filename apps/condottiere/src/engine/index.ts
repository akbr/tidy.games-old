import type { CondottiereEngine } from "./types";
import { startRound, reducerFns } from "./reducersFns";
import { createReducer } from "@lib/fsm";

export const engine: CondottiereEngine = {
  shouldAddSeat: (numSeats, gameStarted) => numSeats < 6 && !gameStarted,
  shouldStart: (numSeats) => numSeats >= 2,
  getInitialState: (numPlayers) => startRound({ numPlayers }),
  reducer: createReducer(reducerFns),
  isMsg: (s) => s.type === "err",
  adapt: (s, seatIndex) => {
    return {
      type: s.type,
      data: {
        ...s.data,
        hands: s.data.hands.map((hand, idx) => (idx === seatIndex ? hand : [])),
        // TO DO: mask discard status/results as appropriate
      },
    };
  },
};

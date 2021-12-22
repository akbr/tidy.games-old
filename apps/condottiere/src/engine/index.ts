import type { Engine } from "@lib/io/engine";
import type { CondottiereTypes } from "./types";
import { createReducer } from "@lib/io/engine/reducer";
import { startRound, reducerFns } from "./reducersFns";

export const engine: Engine<CondottiereTypes> = {
  shouldAddSeat: (numSeats, gameStarted) => numSeats < 6 && !gameStarted,
  shouldStart: (numSeats) => numSeats >= 2,
  getInitialState: (numPlayers, options) =>
    startRound({ numPlayers, seed: options ? options.seed : undefined }),
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

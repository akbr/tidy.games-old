import { Engine } from "@lib/io/engine";
import { createReducer } from "@lib/io/engine/reducer";
import type { WizardTypes } from "./types";
import { toDeal, reducerFns } from "./reducerFns";
import { createBot } from "./createBot";

export const engine: Engine<WizardTypes> = {
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
    } as WizardTypes["states"];
  },
  createBot,
};

export const actionStubs = {
  selectTrump: null,
  play: null,
  bid: null,
};

import type { WizardEngine } from "./types";
import { getInitialState, reducer } from "./reducer";
import { createBot } from "./createBot";

export const engine: WizardEngine = {
  shouldAddSeat: (numSeats, gameStarted) => numSeats < 6 && !gameStarted,
  shouldStart: (numSeats) => numSeats >= 2,
  getInitialState,
  reducer,
  isState: (x) => x.type !== "err",
  adapt: (state, seatIndex) =>
    "hands" in state
      ? {
          ...state,
          hands: state.hands.map((hand, idx) =>
            idx === seatIndex ? hand : []
          ),
        }
      : state,
  createBot,
};

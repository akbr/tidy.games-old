import type { WizardEngine } from "./types";
import {
  toDeal,
  onSelectTrump,
  onBid,
  onPlay,
  err,
  onTrickEnd,
  onDeal,
  onTurnEnd,
  onBidEnd,
  onShowScores,
} from "./reducerFns";

export const getInitialState: WizardEngine["getInitialState"] = (
  numSeats,
  options
) =>
  toDeal({
    numPlayers: numSeats,
    options: options || { canadian: false },
  });

const isString = (x: unknown) => typeof x === "string";
const isNumber = (x: unknown) => typeof x === "number";

export const reducer: WizardEngine["reducer"] = (state, context, input) => {
  /**
   * Inputs
   */
  if (input) {
    const { action, seatIndex } = input;

    const isTurn = state.activePlayer === seatIndex;
    if (!isTurn) return err("Not your turn.");

    const actionMatch = () => state.type === action.type;

    if (
      state.type === "selectTrump" &&
      actionMatch() &&
      isString(action.data)
    ) {
      return onSelectTrump(state, action.data as string);
    }

    if (state.type === "bid" && actionMatch() && isNumber(action.data)) {
      return onBid(state, action.data as number);
    }

    if (state.type === "play" && actionMatch() && isString(action.data)) {
      return onPlay(state, action.data as string);
    }

    return err("Invalid action for this state.");
  }
  /**
   * Auto advances
   */
  if (state.type === "deal") return onDeal(state);
  if (state.type === "bidEnd") return onBidEnd(state);
  if (state.type === "trickEnd") return onTrickEnd(state);
  if (state.type === "turnEnd") return onTurnEnd(state);
  if (state.type === "showScores") return onShowScores(state);

  /**
   * Stop rollin'
   */
  return state;
};

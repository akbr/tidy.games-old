export const getBidsStatus = (bids: (number | null)[]) => !bids.includes(null);
export const getBidsDiff = (bids: (number | null)[], turn: number) =>
  bids.map((x) => (x === null ? 0 : x)).reduce((prev, curr) => prev + curr, 0) -
  turn;
export const getScore = (bid: number, actual: number) => {
  let diff = Math.abs(bid - actual);
  return diff === 0 ? bid * 10 + 20 : diff * -10;
};

/**
 *     isValidPlay: (cardId: string) => {
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
 */

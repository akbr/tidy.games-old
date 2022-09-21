import { Board } from "./gameTypes";

const steps = [moveTransit];

export function getNextTick(board: Board): Board {
  return steps.reduce((board, fn) => fn(board), board);
}

function moveTransit(board: Board): Board {
  const nextTransit = board.transit.map((t) => ({
    ...t,
    distance: t.distance + 10,
  }));

  return {
    ...board,
    transit: nextTransit,
  };
}

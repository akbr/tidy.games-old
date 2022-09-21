import { Board, Orders } from "./gameTypes";
import { getNextTick } from "./getNextTick";

export function resolveTurn(
  board: Board,
  orders: Orders,
  numTicks: number
): Board[] {
  const newTransit: Board["transit"] = [];
  orders.forEach((order) => {
    newTransit.push({ ...order, distance: 0 });
  });

  const boards: Board[] = [
    { ...board, transit: board.transit.concat(newTransit) },
  ];
  for (let i = numTicks; i > 0; i--) {
    const curr = boards.at(-1) || board;
    const next = getNextTick(curr);
    boards.push(next);
  }

  return boards;
}

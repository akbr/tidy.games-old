import { Board } from "../game.types";

export const increments = [income, moveTransit];

function income(board: Board, numTicks: number) {
  board.assets = board.assets.map((a) => a + 1 * numTicks);
}

const moveSpeed = 10;
function moveTransit(board: Board, numTicks: number) {
  board.transit.forEach((t) => {
    t.distance += moveSpeed * numTicks;
  });
}

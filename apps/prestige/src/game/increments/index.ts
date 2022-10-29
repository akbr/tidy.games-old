import { produce } from "immer";
import { Board } from "../game.types";
import { increments } from "./increments.rules";

const modSteps = increments.map((fn) => produce(fn));

export function runIncrements(board: Board, numTicks: number) {
  return modSteps.reduce((board, fn) => fn(board, numTicks), board);
}

export default runIncrements;

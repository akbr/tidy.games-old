import { produce } from "immer";
import { Board } from "../game.types";
import { Orders } from "./orders.types";
import orderFns from "./orders.rules";

type CommitOrderFns = {
  [O in Orders as O["type"]]: (board: Board, order: O) => void;
};

export function commitOrders(board: Board, orders: Orders[]) {
  orders.forEach((o) => {
    board = produce(orderFns[o.type])(board, o);
  });

  return board;
}

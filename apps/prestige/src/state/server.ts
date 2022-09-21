import { Board, MoveOrder, Order } from "./gameTypes";
import { getInitialBoard } from "./getInitialBoard";
import { resolveTurn } from "./resolveTurn";
import { nanoid } from "nanoid";

type GameEntry = {
  board: Board;
  orders: Order[];
  turns: { board: Board; orders: Order[]; numTicks: number }[];
};

export type Server = ReturnType<typeof createServer>;

export function createServer() {
  const db: Record<string, GameEntry> = {};

  return {
    createGame: (id: string) => {
      db[id] = {
        board: getInitialBoard(),
        orders: [],
        turns: [],
      };

      return true;
    },

    get: (
      id: string,
      turnNum?: number
    ): {
      turn: number;
      numTurns: number;
      board: Board;
      orders: MoveOrder[];
      numTicks?: number;
    } => {
      const entry = db[id];
      const numTurns = entry.turns.length + 1;

      const modTurn =
        turnNum === undefined
          ? numTurns
          : turnNum === -1
          ? entry.turns.length
          : turnNum;

      const turn = entry.turns[modTurn - 1] || {
        board: entry.board,
        orders: entry.orders,
        numTurns,
        turn: numTurns,
        numTicks: undefined,
      };

      return {
        ...turn,
        turn: modTurn,
        numTurns,
      };
    },

    submit: <O extends Omit<Order, "id">>(id: string, order: O) => {
      const entry = db[id];
      const modOrder = { ...order, id: nanoid(10) };
      entry.orders = [...entry.orders, modOrder];
      return entry.orders;
    },

    resolve: (id: string) => {
      const numTicks = 10;

      const entry = db[id];
      const { board, orders, turns } = entry;

      turns.push({ board, orders, numTicks });

      entry.board = resolveTurn(board, orders, numTicks).at(-1)!;
      entry.orders = [];

      return true;
    },
  };
}

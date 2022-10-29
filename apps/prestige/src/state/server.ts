import { Board, Events, Orders } from "../game/game.types";
import { createBoard } from "../game/board/";
import { resolve } from "../game/resolve2";

import { nanoid } from "nanoid";
import { Optional } from "../game/utils";

export type CurrentEntry = {
  board: Board;
  orders: Orders[];
};

export type ResolvedEntry = CurrentEntry & {
  events: Events[];
  numTicks: number;
};

export type EntryRes = (CurrentEntry | ResolvedEntry) & {
  id: string;
  player: number;
  turn: number;
};

export type DBEntry = {
  current: CurrentEntry;
  history: ResolvedEntry[];
};

export type Server = ReturnType<typeof createServer>;

export function createServer() {
  let db: Record<string, DBEntry> = {};

  return {
    createGame: (id: string) => {
      db[id] = {
        current: { board: createBoard(), orders: [] },
        history: [],
      };
    },

    get: (id: string, player: number, turnNum?: number): EntryRes | string => {
      const entry = db[id];
      const maxTurn = entry.history.length + 1;
      const turn = turnNum === undefined ? maxTurn : turnNum;
      if (turn > maxTurn || turn < 1) return "Invalid turn number.";
      if (turn > entry.history.length)
        return { ...entry.current, turn, id, player };
      return { ...entry.history[turn - 1], turn, id, player };
    },

    submit: <O extends Optional<Orders, "id">>(
      id: string,
      order: O
    ): Orders => {
      const validatedOrder = { ...order, id: order.id || nanoid(10) };
      const current = db[id].current;
      db[id].current = {
        ...current,
        orders: current.orders.concat(validatedOrder),
      };
      return validatedOrder;
    },

    resolve: (id: string, numTicks = 10) => {
      const entry = db[id];
      const current = entry.current;
      const { board, events } = resolve(
        current.board,
        current.orders,
        numTicks
      );

      entry.history.push({
        ...current,
        events,
        numTicks,
      });

      entry.current = {
        board,
        orders: [],
      };
    },

    dump: () => {
      console.log(JSON.stringify(db));
    },
    restore: (input: string) => {
      db = JSON.parse(input) as any;
    },
  };
}

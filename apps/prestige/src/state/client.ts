import { Emitter } from "@lib/emitter";
import { createSetFn } from "@lib/emitter";
import {
  getBoardAtTick,
  getIntermediateBoards,
  IntermediateBoard,
} from "src/game/resolve2";
import { Orders } from "../game/game.types";
import { Optional } from "../game/utils";
import type { Server, EntryRes } from "./server";
import { TableState, TableStateActions } from "./tableState";

export function createClient(
  server: Server,
  tableState: Emitter<TableState>,
  tableActions: TableStateActions
) {
  const tableSet = createSetFn(tableState);

  let res: EntryRes;
  let id: string;
  let boards: IntermediateBoard[] = [];

  const clientActions = {
    setId: (_id: string) => {
      id = _id;
    },

    createGame: () => server.createGame(id),

    fetch: (turnNum?: number) => {
      const _res = server.get(id, 0, turnNum);

      if (typeof _res === "string") {
        console.warn(res);
        return;
      }

      res = _res;

      if ("events" in res) {
        const { board, orders, events, numTicks } = res;
        boards = getIntermediateBoards(board, orders, events, numTicks);
      }

      clientActions.updateTable();
    },

    updateTable: (tick = 0) => {
      const _res = res;
      const isPastTurn = "events" in _res;

      tableSet({
        id: _res.id,
        player: _res.player,
        turn: _res.turn,
        board:
          isPastTurn && tick > 0 ? getBoardAtTick(boards, tick) : _res.board,
        orders: isPastTurn && tick > 0 ? [] : _res.orders,
        ticks: isPastTurn
          ? {
              numTicks: _res.numTicks,
              tick,
            }
          : null,
        events: isPastTurn ? _res.events : [],
        visibleEvents: isPastTurn
          ? _res.events.filter((e) => e.ticks <= tick)
          : [],
      });
    },

    resolve: () => {
      server.resolve(id);
      clientActions.fetch();
    },

    submit: (order: Optional<Orders, "id">) => {
      server.submit(id, order);
      clientActions.fetch();
      tableActions.select(null);
    },
  };

  return clientActions;
}

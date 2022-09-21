import {
  createActions,
  createSet,
  createSubscribable,
  createUseSubscribable,
} from "@lib/subscribable";
import { Board, Orders, System, Order, TransitFleet } from "./gameTypes";
import { getData } from "./onSelect";

export type GameState = {
  //--- Core
  turn: number;
  numTurns: number;
  board: Board;
  orders: Orders;
  seek?: [number, number];
  //--- Ui
  selected:
    | null
    | { type: "system"; data: System }
    | { type: "moveOrder"; data: Order }
    | { type: "transit"; data: TransitFleet }
    | { type: "planMoveOrder"; from: System; to: System };
  mode: "moveSelect" | null;
};

export const gameStore = createSubscribable<GameState>({
  turn: 1,
  numTurns: 1,
  board: { systems: [], transit: [], cxns: [] },
  orders: [],
  // ---
  selected: null,
  mode: null,
});

export const _set = createSet(gameStore);

export const set = (update: Parameters<typeof _set>[0]) => {
  let prev = gameStore.get();
  let partial = { ...update };

  // Sync selected
  if (
    (partial.board || partial.orders) &&
    prev.selected &&
    "data" in prev.selected
  ) {
    partial.selected = getData(prev.selected.data.id, {
      board: partial.board || prev.board,
      orders: partial.orders || prev.orders,
    });
  }

  _set(partial);
};

export const useGame = createUseSubscribable(gameStore);

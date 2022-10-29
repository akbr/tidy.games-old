import {
  createActions,
  createSubscribable,
  Subscribable,
} from "@lib/subscribable";
import { getBlankBoard } from "../game/board";
import { Board, Orders, Events } from "../game/game.types";
import { System, Transit } from "../game/board/board.types";
import { getById } from "src/game/utils";

export type TableState = {
  id: string;
  player: number;
  turn: number;
  board: Board;
  orders: Orders[];
  selected:
    | null
    | System
    | Transit
    | Orders
    | Events
    | { type: "planMove"; from: string; to: string };
  mode: null | "selectMove";
  events: Events[];
  visibleEvents: Events[];
  ticks: { tick: number; numTicks: number } | null;
};

export const createTableState = () =>
  createSubscribable<TableState>({
    id: "",
    player: 0,
    turn: 1,
    board: getBlankBoard(),
    orders: [],
    // ---
    ticks: null,
    events: [],
    visibleEvents: [],
    //---
    selected: null,
    mode: null,
  });

export const TableState = createTableState();

export const createTableStateActions = (TableState: Subscribable<TableState>) =>
  createActions(TableState, (set, get) => ({
    setMode: (mode: TableState["mode"]) => set({ mode }),

    select: (item: TableState["selected"] | string) => {
      const gs = get();
      let selected = typeof item === "string" ? searchId(item, gs) : item;

      if (selected === null) {
        set({ selected, mode: null });
        return;
      }

      // Mode branch logic -- refactor into own place?
      if (
        gs.mode === "selectMove" &&
        selected.type === "system" &&
        gs.selected?.type === "system"
      ) {
        return set({
          selected: {
            type: "planMove",
            from: gs.selected.id,
            to: selected.id,
          },
        });
      }

      set({ selected });
    },
  }));

export type TableStateActions = ReturnType<typeof createTableStateActions>;

function searchId(id: string, gs: TableState) {
  return (
    getById(gs.board.systems, id) ||
    getById(gs.board.transit, id) ||
    getById(gs.orders, id) ||
    getById(gs.events, id) ||
    null
  );
}

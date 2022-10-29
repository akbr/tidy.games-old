import { Board, Transit } from "../board/board.types";

export type Event = { type: string; ticks: number };

export type EventLogic<E extends Event> = {
  getNext: (board: Board) => E | null;
  beforeResolve?: (event: E, board: Board) => void;
  resolve: (board: Board, event: E) => void;
};

export type TransitArrive = {
  type: "transitArrive";
  id: string;
  ticks: number;
  transit: Transit;
};

export type TransitBattle = {
  type: "transitBattle";
  id: string;
  ticks: number;
  transits: Transit[];
};

export type Events = TransitArrive | TransitBattle;

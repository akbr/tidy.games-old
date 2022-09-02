import type { CreateSpec } from "@lib/tabletop";
import type { Cards, Cities, Mercenaries } from "./glossary";

export type CondottiereSpec = CreateSpec<{
  phases:
    | "deal"
    | "choose"
    | "chosen"
    | "play"
    | "played"
    | "placed"
    | "passed"
    | "retreat"
    | "retreated"
    | "battleEnd"
    | "discard"
    | "discarded"
    | "discardsComplete"
    | "end";
  game: {
    round: number;
    condottiere: number;
    player: number | null;
    playStatus: boolean[];
    discardStatus: (null | boolean)[];
    discardResults: (null | boolean)[];
    map: Record<Cities, null | number>;
    battleLocation: Cities | null;
    battleStatus: number | null;
    hands: Cards[][];
    lines: Cards[][];
    winner: null | number;
  };
  actions:
    | { type: "choose"; data: Cities }
    | { type: "play"; data: Cards | false }
    | { type: "retreat"; data: Mercenaries | false }
    | { type: "discard"; data: boolean };
}>;

export default CondottiereSpec;

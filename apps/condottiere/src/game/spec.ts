import type { CreateSpec } from "@lib/tabletop";
import type { Cards, Cities, Mercenaries } from "./glossary";

type Phases =
  | "deal"
  | "choose"
  | "chosen"
  | "play"
  | "played"
  | "passed"
  | "retreat"
  | "retreated"
  | "battleEnd"
  | "discard"
  | "discarded"
  | "discardsComplete"
  | "end";

type Transitions = {
  deal: "choose";
  choose: "chosen" | null;
  chosen: "play";
  play: "played" | "passed" | null;
  played: "play" | "retreat" | "battleEnd";
  retreat: "retreated" | null;
  retreated: "play" | "battleEnd";
  passed: "play" | "battleEnd";
  battleEnd: "discard" | "end";
  discard: "discarded" | null;
  discarded: "discard" | "discardsComplete";
  discardsComplete: "choose" | "deal";
  end: true;
};

export type Game = {
  round: number;
  condottiere: number;
  player: number | null;
  playStatus: boolean[];
  discardStatus: (null | boolean)[];
  discardResults: (null | boolean)[];
  map: Record<Cities, null | number>;
  battleLocation: Cities | null;
  hands: Cards[][];
  lines: Cards[][];
  winner: null | number;
};

type Actions =
  | { type: "choose"; data: Cities }
  | { type: "play"; data: Cards | false }
  | { type: "retreat"; data: Mercenaries | false }
  | { type: "discard"; data: boolean };

export type CondottiereSpec = CreateSpec<{
  phases: Phases;
  game: Game;
  actions: Actions;
  transitions: Transitions;
}>;

export default CondottiereSpec;

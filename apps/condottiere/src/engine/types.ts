import { CreateEngineTypes } from "@lib/io/engine/";

export type CondottiereTypes = CreateEngineTypes<
  StateGlossary,
  MsgGlossary,
  ActionGlossary,
  { seed?: string },
  void
>;

export type Mercenaries = 1 | 2 | 3 | 4 | 5 | 6 | 10;
export type Specials = "s" | "d" | "b" | "m" | "w" | "h";
export type Cards = Mercenaries | Specials;
export type Cities =
  | "tor"
  | "mil"
  | "ven"
  | "gen"
  | "man"
  | "par"
  | "mod"
  | "fer"
  | "luc"
  | "bol"
  | "fir"
  | "sie"
  | "urb"
  | "anc"
  | "spo"
  | "rom"
  | "nap";

export type Core = {
  round: number;
  numPlayers: number;
  condotierre: number;
  activePlayer: number;
  map: Record<Cities, null | number>;
  hands: Cards[][];
  lines: Cards[][];
  playStatus: boolean[];
  seed?: string;
  // ---
  winner: number | null;
  discardStatus: null | (null | boolean)[];
  retreatStatus: null | false | Mercenaries;
};

export type StateGlossary = {
  deal: Core;
  choose: Core;
  chosen: Core;
  play: Core;
  played: Core;
  retreat: Core;
  retreated: Core;
  battleEnd: Core;
  discard: Core;
  discardResults: Core;
  gameEnd: Core;
};

export type MsgGlossary = {
  err: string;
};

export type ActionGlossary = {
  choose: Cities;
  play: Cards | false;
  retreat: Mercenaries | false;
  discard: boolean;
};

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
  // ------
  // Static
  // ------
  numPlayers: number;
  seed?: string;
  // -------
  // Context
  // -------
  round: number;
  activePlayer: number;
  condottiere: number;
  status: (boolean | null)[]; // Players in active play OR async discard decisions
  // ---------
  // Materials
  // ---------
  map: Record<Cities, null | number>;
  hands: Cards[][];
  lines: Cards[][];
};

export type StateGlossary = {
  deal: Core & { msg: null };
  choose: Core & { msg: null };
  chosen: Core & { msg: Cities };
  play: Core & { msg: null };
  played: Core & { msg: Cards | false };
  retreat: Core & { msg: null };
  retreated: Core & { msg: Cards | false };
  battleEnd: Core & { msg: [number, Cities] };
  discard: Core & { msg: null };
  discardResults: Core & { msg: null };
  gameEnd: Core & { msg: number };
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

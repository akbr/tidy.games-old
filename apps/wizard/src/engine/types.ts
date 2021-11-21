import { Engine } from "@lib/socket-server/types";

export type WizardShape = {
  states:
    | Deal
    | SelectTrump
    | Bid
    | BidEnd
    | Play
    | TrickEnd
    | TurnEnd
    | ShowScores
    | GameEnd;
  actions: SelectTrumpAction | BidAction | PlayAction;
  msgs: Err;
  options: { canadian: boolean };
  botOptions: void;
};

export type WizardEngine = Engine<WizardShape>;

// ---

export type Core = {
  options: WizardShape["options"];
  numPlayers: number;
  turn: number;
  activePlayer: number | null;
  dealer: number;
  bids: (number | null)[];
  actuals: number[];
  scores: number[][];
  trumpCard: string | null;
  trumpSuit: string | null;
  hands: string[][];
  trick: string[];
  trickLeader: number;
  trickWinner: number | null;
};

type Active = { activePlayer: number };

/**
 * States
 */

export type Err = { type: "err"; data: string };

export type Deal = { type: "deal" } & Core;
export type SelectTrump = { type: "selectTrump" } & Core & Active;
export type Bid = { type: "bid" } & Core & Active;
export type BidEnd = { type: "bidEnd" } & Core;
export type Play = { type: "play" } & Core & Active;
export type TrickEnd = { type: "trickEnd" } & Core & { trickWinner: number };
export type TurnEnd = { type: "turnEnd" } & Core;
export type ShowScores = { type: "showScores" } & Core;
export type GameEnd = { type: "gameEnd" } & Core;

export type Seed = {
  numPlayers: number;
  options: WizardShape["options"];
};

/**
 * Actions
 */
export type SelectTrumpAction = {
  type: "selectTrump";
  data: string;
};

export type BidAction = {
  type: "bid";
  data: number;
};

export type PlayAction = {
  type: "play";
  data: string;
};

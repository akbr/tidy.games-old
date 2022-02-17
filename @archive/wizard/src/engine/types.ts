import { CreateEngineTypes } from "@lib/io/engine";

export type WizardTypes = CreateEngineTypes<
  StateGlossary,
  MsgGlossary,
  ActionGlossary,
  Options,
  void
>;

type Core = {
  options: WizardTypes["options"];
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
type NotActive = { activePlayer: null };
type TrickWinner = { trickWinner: number };
export type StateGlossary = {
  deal: Core & NotActive;
  selectTrump: Core & Active;
  bid: Core & Active;
  bidEnd: Core & NotActive;
  play: Core & Active;
  trickEnd: Core & TrickWinner & NotActive;
  turnEnd: Core & NotActive;
  showScores: Core & NotActive;
  gameEnd: Core & NotActive;
};

type MsgGlossary = {
  err: string;
};

type Options = { canadian: boolean };

type ActionGlossary = {
  selectTrump: string;
  bid: number;
  play: string;
};

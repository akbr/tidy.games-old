import { Engine } from "@lib/io/engine";
import { UnionizeObj, ReducerFns } from "@lib/io/reducer";

export type WizardShape = {
  states: UnionizeObj<StateGlossary>;
  msgs: UnionizeObj<MsgGlossary>;
  actions: UnionizeObj<ActionGlossary>;
  options: { canadian: boolean };
  botOptions: void;
};

export type WizardEngine = Engine<WizardShape>;
export type WizardReducerFns = ReducerFns<
  StateGlossary & MsgGlossary,
  ActionGlossary
>;

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
type TrickWinner = { trickWinner: number };
export type StateGlossary = {
  deal: Core;
  selectTrump: Core & Active;
  bid: Core & Active;
  bidEnd: Core;
  play: Core & Active;
  trickEnd: Core & TrickWinner;
  turnEnd: Core;
  showScores: Core;
  gameEnd: Core;
};

export type MsgGlossary = {
  err: string;
};

export type ActionGlossary = {
  selectTrump: string;
  bid: number;
  play: string;
};

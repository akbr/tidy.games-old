import { CreateSpec } from "@lib/tabletop";

export type WizardSpec = CreateSpec<{
  phases:
    | "roundStart"
    | "deal"
    | "trumpReveal"
    | "select"
    | "selected"
    | "bid"
    | "bidded"
    | "bidsEnd"
    | "play"
    | "played"
    | "trickWon"
    | "roundEnd"
    | "end";
  game: {
    round: number;
    player: number | null;
    dealer: number;
    trumpCard: string | null;
    trumpSuit: string | null;
    bids: (number | null)[];
    actuals: number[];
    hands: string[][];
    trick: string[];
    trickLeader: number;
    trickWinner: number | null;
    scores: number[][];
  };
  actions:
    | { type: "select"; data: string }
    | { type: "bid"; data: number }
    | { type: "play"; data: string };
  options: { canadian: boolean; numRounds: number };
  transitions: {
    roundStart: null | "deal";
    deal: "trumpReveal";
    trumpReveal: "select" | "bid";
    select: null | "selected";
    selected: "bid";
    bid: null | "bidded";
    bidded: "bid" | "bidsEnd";
    bidsEnd: "play";
    play: null | "played";
    played: "play" | "trickWon";
    trickWon: "play" | "roundEnd";
    roundEnd: "roundStart" | "end";
    end: true;
  };
  constraints: {
    roundStart: { player: null };
    deal: { player: null };
    select: { player: number };
    selected: { player: number };
    bid: { player: number };
    bidded: { player: number };
    play: { player: number };
    played: { player: number };
    trickWon: { player: null; trickWinner: number };
    roundEnd: { player: null };
    end: { player: null };
  };
}>;

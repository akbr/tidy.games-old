import type { CreateEngineTypes, Chart, GetInitialState } from "@lib/engine";
import { createEngine } from "@lib/engine";

import { rotateIndex } from "@lib/array";
import { getDeal, getWinningIndex } from "./logic";

export type GameState = {
  seed?: string;
  numPlayers: number;
  player: number | null;
  actuals: number[];
  scores: number[][];
  round: number;
  dealer: number;
  hands: string[][];
  trick: string[];
  bids: (number | null)[];
  trumpCard: string | null;
  trumpSuit: string | null;
  trickLeader: number;
  trickWinner: number | null;
};

export type StatesGlossary = {
  startRound: GameState;
  deal: GameState;
  select: GameState;
  bid: GameState;
  bidsEnd: GameState;
  play: GameState;
  playEnd: GameState;
  end: GameState;
};

export type ActionsGlossary = {
  select: string;
  bid: number;
  play: string;
};

export type Options = {
  seed?: string;
};

export type WizardTypes = CreateEngineTypes<
  StatesGlossary,
  ActionsGlossary,
  Options
>;

const nextRound = (
  data:
    | { numPlayers: number; seed?: string }
    | WizardTypes["stateDict"]["playEnd"]
): WizardTypes["states"] => {
  const dealer =
    "dealer" in data ? rotateIndex(data.numPlayers, data.dealer) : 0;
  const scores =
    "scores" in data
      ? ([...data.scores, data.bids, data.actuals] as number[][])
      : [];

  return {
    type: "startRound",
    data: {
      seed: data.seed,
      numPlayers: data.numPlayers,
      player: null,
      round: "round" in data ? data.round + 1 : 1,
      dealer,
      hands: Array.from({ length: data.numPlayers }, () => []),
      trumpCard: null,
      trumpSuit: null,
      trick: [],
      trickLeader: rotateIndex(data.numPlayers, dealer),
      trickWinner: null,
      bids: Array.from({ length: data.numPlayers }, () => null),
      actuals: Array.from({ length: data.numPlayers }, () => 0),
      scores: scores,
    },
  };
};

export const getInitialState: GetInitialState<WizardTypes> = (
  { numPlayers },
  options
) => nextRound({ numPlayers, seed: options ? options.seed : undefined });

export const chart: Chart<WizardTypes> = {
  startRound: ({ data }) => {
    const { hands, trumpCard, trumpSuit } = getDeal(
      data.numPlayers,
      data.round,
      data.seed
    );

    return {
      type: "deal",
      data: {
        ...data,
        hands,
        trumpCard,
        trumpSuit,
      },
    };
  },
  deal: ({ data }) => {
    if (data.trumpSuit === "w") {
      return {
        type: "select",
        data: {
          ...data,
          player: data.dealer,
        },
      };
    }

    return {
      type: "bid",
      data: {
        ...data,
        player: rotateIndex(data.numPlayers, data.dealer),
      },
    };
  },
  select: (s, a) => {
    if (!a) return s;
    if (a.type !== s.type || a.player !== s.data.player)
      return "Action mismatch.";
    if (!["c", "d", "h", "s"].includes(a.data)) return "Invalid suit.";
    return {
      type: "bid",
      data: {
        ...s.data,
        trumpSuit: a.data,
        player: rotateIndex(s.data.numPlayers, s.data.dealer),
      },
    };
  },
  bid: (s, a) => {
    if (!a) return s;
    if (a.type !== s.type || a.player !== s.data.player)
      return "Action mismatch.";
    if (a.data < 0 || a.data > s.data.round) return "Invalid bid.";

    const bids = s.data.bids.map((bid, i) => (i === a.player ? a.data : bid));

    if (bids.includes(null)) {
      return {
        type: "bid",
        data: {
          ...s.data,
          player: rotateIndex(s.data.numPlayers, s.data.player),
          bids,
        },
      };
    }

    return {
      type: "bidsEnd",
      data: {
        ...s.data,
        player: null,
        bids,
      },
    };
  },
  bidsEnd: (s) => ({
    type: "play",
    data: {
      ...s.data,
      player: rotateIndex(s.data.numPlayers, s.data.dealer),
    },
  }),
  play: (s, a) => {
    if (!a) return s;
    if (a.type !== s.type || a.player !== s.data.player)
      return "Action mismatch.";
    if (!s.data.hands[a.player].includes(a.data))
      return "You don't have that card.";

    const hands = s.data.hands.map((hand, i) =>
      i === a.player! ? hand.filter((card) => card !== a.data) : hand
    );
    const trick = [...s.data.trick, a.data];

    if (trick.length < s.data.numPlayers) {
      return {
        type: "play",
        data: {
          ...s.data,
          hands,
          trick,
          player: rotateIndex(s.data.numPlayers, s.data.player),
        },
      };
    }

    return {
      type: "playEnd",
      data: {
        ...s.data,
        hands,
        trick,
        player: null,
        trickWinner: getWinningIndex(trick, s.data.trumpSuit),
      },
    };
  },
  playEnd: (s) => {
    const roundContinues = s.data.hands[0].length > 0;
    if (roundContinues) {
      let trickLeader = rotateIndex(
        s.data.numPlayers,
        s.data.trickWinner!,
        s.data.trickLeader
      );
      return {
        type: "play",
        data: {
          ...s.data,
          trickLeader,
          player: trickLeader,
        },
      };
    }

    const gameContinues = s.data.numPlayers * s.data.round !== 60;
    if (gameContinues) {
      return nextRound(s.data);
    }

    return {
      type: "end",
      data: {
        ...s.data,
        scores: [...s.data.scores, s.data.bids, s.data.actuals] as number[][],
      },
    };
  },
  end: (s) => s,
};

export const engine = createEngine({ getInitialState, chart });

import { Reducer, withAction } from "@lib/tabletop";
import { rotateIndex } from "@lib/array";

import { WizardSpec } from "./spec";
import { getDeal, getWinningIndex, getPlayableCards, checkBid } from "./logic";

export const getNextRound = (
  { numPlayers }: { numPlayers: number },
  board = {} as WizardSpec["board"]
) => {
  const dealer =
    board.dealer !== undefined ? rotateIndex(numPlayers, board.dealer, 1) : 0;
  const scores = board.scores
    ? ([...board.scores, board.bids, board.actuals] as number[][])
    : [];

  const nextRound: WizardSpec["board"] = {
    phase: "roundStart",
    player: null,
    round: board.round ? board.round + 1 : 1,
    dealer,
    hands: Array.from({ length: numPlayers }, () => []),
    trumpCard: null,
    trumpSuit: null,
    trick: [],
    trickLeader: rotateIndex(numPlayers, dealer, 1),
    trickWinner: null,
    bids: Array.from({ length: numPlayers }, () => null),
    actuals: Array.from({ length: numPlayers }, () => 0),
    scores,
  };

  return nextRound;
};

export const wizardReducer: Reducer<WizardSpec> = {
  roundStart: (b, c) => {
    const { hands } = getDeal(c.numPlayers, b.round, c.seed + b.round);

    return {
      ...b,
      phase: "deal",
      hands,
    };
  },

  deal: (b, c) => {
    const { trumpCard, trumpSuit } = getDeal(
      c.numPlayers,
      b.round,
      c.seed + b.round
    );

    return {
      ...b,
      phase: "trumpReveal",
      trumpCard,
      trumpSuit,
    };
  },

  trumpReveal: (b, c) =>
    b.trumpSuit === "w"
      ? { ...b, phase: "select", player: b.dealer }
      : {
          ...b,
          phase: "bid",
          player: rotateIndex(c.numPlayers, b.dealer, 1),
        },

  select: withAction(
    (a, b) => {
      if (a.player !== b.player) return "It's not your turn.";
      if (a.type !== b.phase) return "Invalid action type.";
      if (!["c", "d", "h", "s"].includes(a.data)) return "Invalid suit.";
      return a;
    },
    (b, a, c) => ({
      ...b,
      phase: "selected",
      trumpSuit: a.data,
      player: rotateIndex(c.numPlayers, b.dealer, 1),
    })
  ),

  selected: (b) => ({
    ...b,
    phase: "bid",
  }),

  bid: withAction(
    (a, b, c) => {
      if (a.type !== b.phase || a.player !== b.player) return "Action mismatch";
      const bidErr = checkBid(a.data, b, c.options);
      if (bidErr) return bidErr;
      return a;
    },
    (b, a) => {
      const nextBids = b.bids.map((bid, i) => (i === a.player ? a.data : bid));
      return { ...b, phase: "bidded", bids: nextBids };
    }
  ),

  bidded: (b, c) =>
    b.bids.includes(null)
      ? { ...b, phase: "bid", player: rotateIndex(c.numPlayers, b.player!, 1) }
      : { ...b, phase: "bidsEnd", player: null },

  bidsEnd: (b, c) => ({
    ...b,
    phase: "play",
    player: rotateIndex(c.numPlayers, b.dealer, 1),
  }),

  play: withAction(
    (a, b) => {
      if (a.type !== b.phase || a.player !== b.player) return "Action mismatch";
      const hand = b.hands[a.player];
      if (!hand.includes(a.data)) return "You don't have that card.";
      if (!getPlayableCards(hand, b.trick).includes(a.data))
        return "Illegal play.";
      return a;
    },
    (b, a) => {
      const nextHands = b.hands.map((hand, i) =>
        i === a.player! ? hand.filter((card) => card !== a.data) : hand
      );
      const nextTrick = [...b.trick, a.data];

      return { ...b, phase: "played", hands: nextHands, trick: nextTrick };
    }
  ),

  played: (b, c) =>
    b.trick.length < c.numPlayers
      ? { ...b, phase: "play", player: rotateIndex(c.numPlayers, b.player!, 1) }
      : {
          ...b,
          phase: "trickWon",
          player: null,
          trickWinner: rotateIndex(
            c.numPlayers,
            getWinningIndex(b.trick, b.trumpSuit),
            b.trickLeader
          ),
        },

  trickWon: (b) => {
    const roundContinues = b.hands[0].length > 0;
    const nextActuals = b.actuals.map((n, idx) =>
      idx === b.trickWinner ? n + 1 : n
    );

    if (roundContinues) {
      return {
        ...b,
        phase: "play",
        actuals: nextActuals,
        trick: [],
        trickLeader: b.trickWinner!,
        trickWinner: null,
        player: b.trickWinner,
      };
    }

    return {
      ...b,
      phase: "roundEnd",
      actuals: nextActuals,
      trick: [],
      trickWinner: null,
    };
  },

  roundEnd: (b, c) => {
    const gameContinues = c.options.numRounds !== b.round;

    return gameContinues
      ? getNextRound(c, b)
      : {
          ...b,
          phase: "end",
          scores: [...b.scores, b.bids, b.actuals] as number[][],
        };
  },

  end: () => true,
};

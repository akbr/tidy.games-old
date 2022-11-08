import { Chart, withAction } from "@lib/tabletop";
import { rotateIndex } from "@lib/array";

import { WizardSpec } from "./spec";
import { getDeal, getWinningIndex, getPlayableCards, checkBid } from "./logic";

export const getNextRound = (
  { numPlayers }: { numPlayers: number },
  g = {} as WizardSpec["game"]
) => {
  const dealer =
    g.dealer !== undefined ? rotateIndex(numPlayers, g.dealer, 1) : 0;
  const scores = g.scores
    ? ([...g.scores, g.bids, g.actuals] as number[][])
    : [];

  const nextRound: WizardSpec["game"] = {
    phase: "roundStart",
    player: null,
    round: g.round ? g.round + 1 : 1,
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

export const wizardChart: Chart<WizardSpec> = {
  roundStart: (g, c) => {
    const { hands } = getDeal(c.numPlayers, g.round, c.seed + g.round);

    return {
      ...g,
      phase: "deal",
      hands,
    };
  },

  deal: (g, c) => {
    const { trumpCard, trumpSuit } = getDeal(
      c.numPlayers,
      g.round,
      c.seed + g.round
    );

    return {
      ...g,
      phase: "trumpReveal",
      trumpCard,
      trumpSuit,
    };
  },

  trumpReveal: (g, c) =>
    g.trumpSuit === "w"
      ? { ...g, phase: "select", player: g.dealer }
      : {
          ...g,
          phase: "bid",
          player: rotateIndex(c.numPlayers, g.dealer, 1),
        },

  select: withAction(
    (a, g) => {
      if (a.player !== g.player) return "It's not your turn.";
      if (a.type !== g.phase) return "Invalid action type.";
      if (!["c", "d", "h", "s"].includes(a.data)) return "Invalid suit.";
      return a;
    },
    (g, a, c) => ({
      ...g,
      phase: "selected",
      trumpSuit: a.data,
      player: rotateIndex(c.numPlayers, g.dealer, 1),
    })
  ),

  selected: (g) => ({
    ...g,
    phase: "bid",
  }),

  bid: withAction(
    (a, g, c) => {
      if (a.type !== g.phase || a.player !== g.player) return "Action mismatch";
      const bidErr = checkBid(a.data, g, c.options);
      if (bidErr) return bidErr;
      return a;
    },
    (g, a) => {
      const nextBids = g.bids.map((bid, i) => (i === a.player ? a.data : bid));
      return { ...g, phase: "bidded", bids: nextBids };
    }
  ),

  bidded: (g, c) =>
    g.bids.includes(null)
      ? { ...g, phase: "bid", player: rotateIndex(c.numPlayers, g.player!, 1) }
      : { ...g, phase: "bidsEnd", player: null },

  bidsEnd: (g, c) => ({
    ...g,
    phase: "play",
    player: rotateIndex(c.numPlayers, g.dealer, 1),
  }),

  play: withAction(
    (a, g) => {
      if (a.type !== g.phase || a.player !== g.player) return "Action mismatch";
      const hand = g.hands[a.player];
      if (!hand.includes(a.data)) return "You don't have that card.";
      if (!getPlayableCards(hand, g.trick).includes(a.data))
        return "Illegal play.";
      return a;
    },
    (g, a) => {
      const nextHands = g.hands.map((hand, i) =>
        i === a.player! ? hand.filter((card) => card !== a.data) : hand
      );
      const nextTrick = [...g.trick, a.data];

      return { ...g, phase: "played", hands: nextHands, trick: nextTrick };
    }
  ),

  played: (g, c) =>
    g.trick.length < c.numPlayers
      ? { ...g, phase: "play", player: rotateIndex(c.numPlayers, g.player!, 1) }
      : {
          ...g,
          phase: "trickWon",
          player: null,
          trickWinner: rotateIndex(
            c.numPlayers,
            getWinningIndex(g.trick, g.trumpSuit),
            g.trickLeader
          ),
        },

  trickWon: (g) => {
    const roundContinues = g.hands[0].length > 0;
    const nextActuals = g.actuals.map((n, idx) =>
      idx === g.trickWinner ? n + 1 : n
    );

    if (roundContinues) {
      return {
        ...g,
        phase: "play",
        actuals: nextActuals,
        trick: [],
        trickLeader: g.trickWinner!,
        trickWinner: null,
        player: g.trickWinner,
      };
    }

    return {
      ...g,
      phase: "roundEnd",
      actuals: nextActuals,
      trick: [],
      trickWinner: null,
    };
  },

  roundEnd: (g, c) => {
    const gameContinues = c.options.numRounds !== g.round;

    return gameContinues
      ? getNextRound(c, g)
      : {
          ...g,
          phase: "end",
          scores: [...g.scores, g.bids, g.actuals] as number[][],
        };
  },

  end: () => true,
};

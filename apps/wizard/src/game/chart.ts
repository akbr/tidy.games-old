import type { Chart } from "@lib/tabletop";
import { rotateIndex } from "@lib/array";

import { WizardSpec } from "./spec";
import { getDeal, getWinningIndex, getPlayableCards, checkBid } from "./logic";
import { withAction } from "@lib/tabletop/core/chart";

export const getNextRound = (
  { numPlayers }: { numPlayers: number },
  state = {} as WizardSpec["states"]
) => {
  const dealer =
    state.dealer !== undefined ? rotateIndex(numPlayers, state.dealer, 1) : 0;
  const scores = state.scores
    ? ([...state.scores, state.bids, state.actuals] as number[][])
    : [];

  const nextRound: WizardSpec["states"] = {
    phase: "roundStart",
    player: null,
    round: state.round ? state.round + 1 : 1,
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
  roundStart: (s, c) => [
    {
      phase: "deal",
      ...getDeal(c.numPlayers, s.round, c.seed + s.round),
    },
    { phase: "trumpReveal" },
    s.trumpSuit === "w"
      ? { phase: "select", player: s.dealer }
      : { phase: "bid", player: rotateIndex(c.numPlayers, s.dealer, 1) },
  ],

  select: withAction(
    (a, s) => {
      if (a.type !== "select" || a.player !== s.player)
        return "Action mismatch.";
      if (!["c", "d", "h", "s"].includes(a.data)) return "Invalid suit.";
      return a;
    },
    (s, c, a) => [
      {
        phase: "selected",
        trumpSuit: a.data,
        player: rotateIndex(c.numPlayers, s.dealer, 1),
      },
      { phase: "bid" },
    ]
  ),

  bid: withAction(
    (a, s) =>
      a.type !== "bid" || a.player !== s.player ? "Action mismatch." : a,
    (s, c, a) => {
      const bidErr = checkBid(a.data, s, c.options);
      if (bidErr) return bidErr;
      const nextBids = s.bids.map((bid, i) => (i === a.player ? a.data : bid));
      return { phase: "bidded", bids: nextBids };
    }
  ),

  bidded: ({ bids, player }, { numPlayers }) =>
    bids.includes(null)
      ? { phase: "bid", player: rotateIndex(numPlayers, player!, 1) }
      : { phase: "bidsEnd", player: null },

  bidsEnd: ({ dealer }, { numPlayers }) => ({
    phase: "play",
    player: rotateIndex(numPlayers, dealer, 1),
  }),

  play: withAction(
    (a, s) =>
      a.type !== "play" || a.player !== s.player
        ? "You don't have that card."
        : a,
    (s, _, a) => {
      const hand = s.hands[a.player];
      if (!hand.includes(a.data)) return "You don't have that card.";
      if (!getPlayableCards(hand, s.trick).includes(a.data))
        return "Illegal play.";

      const nextHands = s.hands.map((hand, i) =>
        i === a.player! ? hand.filter((card) => card !== a.data) : hand
      );
      const nextTrick = [...s.trick, a.data];

      return { phase: "played", hands: nextHands, trick: nextTrick };
    }
  ),

  played: ({ trick, player, trumpSuit, trickLeader }, { numPlayers }) =>
    trick.length < numPlayers
      ? {
          phase: "play",
          player: rotateIndex(numPlayers, player!, 1),
        }
      : {
          phase: "trickWon",
          player: null,
          trickWinner: rotateIndex(
            numPlayers,
            getWinningIndex(trick, trumpSuit),
            trickLeader
          ),
        },

  trickWon: ({ hands, trickWinner, actuals }) => {
    const roundContinues = hands[0].length > 0;
    const nextActuals = actuals.map((n, idx) =>
      idx === trickWinner ? n + 1 : n
    );

    if (roundContinues) {
      return {
        phase: "play",
        actuals: nextActuals,
        trick: [],
        trickLeader: trickWinner!,
        trickWinner: null,
        player: trickWinner,
      };
    }

    return {
      phase: "roundEnd",
      actuals: nextActuals,
      trick: [],
      trickWinner: null,
    };
  },

  roundEnd: (game, ctx) => {
    const { round } = game;
    const gameContinues = ctx.options.numRounds !== round;
    if (gameContinues) return getNextRound(ctx, game);

    const { scores, bids, actuals } = game;
    const nextScores = [...scores, bids, actuals] as number[][];
    return {
      phase: "end",
      scores: nextScores,
    };
  },
  end: () => true,
};

import type { Chart } from "@lib/tabletop";
import { rotateIndex } from "@lib/array";

import { WizardSpec } from "./spec";
import { getDeal, getWinningIndex, getPlayableCards, checkBid } from "./logic";

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
  roundStart: ({ round }, { numPlayers, seed }) =>
    seed
      ? { phase: "deal", ...getDeal(numPlayers, round, seed + round) }
      : null,

  deal: () => ({ phase: "trumpReveal" }),

  trumpReveal: ({ trumpSuit, dealer }, { numPlayers }) =>
    trumpSuit === "w"
      ? { phase: "select", player: dealer }
      : { phase: "bid", player: rotateIndex(numPlayers, dealer, 1) },

  select: ({ player, dealer }, { numPlayers }, action) => {
    if (!action) return null;
    if (action.type !== "select" || action.player !== player)
      return "Action mismatch.";
    if (!["c", "d", "h", "s"].includes(action.data)) return "Invalid suit.";
    return {
      phase: "selected",
      trumpSuit: action.data,
      player: rotateIndex(numPlayers, dealer, 1),
    };
  },

  selected: () => ({ phase: "bid" }),

  bid: (game, { options }, action) => {
    if (!action) return null;
    if (action.type !== "bid" || action.player !== game.player)
      return "Action mismatch.";
    const bidErr = checkBid(action.data, game, options);
    if (bidErr) return bidErr;

    const bids = game.bids.map((bid, i) =>
      i === action.player ? action.data : bid
    );

    return { phase: "bidded", bids };
  },

  bidded: ({ bids, player }, { numPlayers }) =>
    bids.includes(null)
      ? { phase: "bid", player: rotateIndex(numPlayers, player!, 1) }
      : { phase: "bidsEnd", player: null },

  bidsEnd: ({ dealer }, { numPlayers }) => ({
    phase: "play",
    player: rotateIndex(numPlayers, dealer, 1),
  }),

  play: ({ player, hands, trick }, _, action) => {
    if (!action) return null;
    if (action.type !== "play" || action.player !== player)
      return "Action mismatch.";
    const hand = hands[action.player];
    if (!hand.includes(action.data)) return "You don't have that card.";
    if (!getPlayableCards(hand, trick).includes(action.data))
      return "Illegal play.";

    const nextHands = hands.map((hand, i) =>
      i === action.player! ? hand.filter((card) => card !== action.data) : hand
    );
    const nextTrick = [...trick, action.data];

    return { phase: "played", hands: nextHands, trick: nextTrick };
  },

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

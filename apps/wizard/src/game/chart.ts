import type { Chart } from "@lib/tabletop/cart";

import { WizardSpec } from "./spec";
import { rotateIndex } from "@lib/array";
import { getDeal, getWinningIndex, getPlayableCards, checkBid } from "./logic";

type RoundStart = Extract<WizardSpec["gameStates"], { 0: "roundStart" }>;
export const getNextRound = (
  { numPlayers }: { numPlayers: number },
  game = {} as WizardSpec["game"]
): RoundStart => {
  const dealer =
    game.dealer !== undefined ? rotateIndex(numPlayers, game.dealer, 1) : 0;
  const scores = game.scores
    ? ([...game.scores, game.bids, game.actuals] as number[][])
    : [];

  return [
    "roundStart",
    {
      player: null,
      round: game.round ? game.round + 1 : 1,
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
    },
  ];
};

export const wizardChart: Chart<WizardSpec> = {
  roundStart: ({ round }, { numPlayers, seed }) =>
    seed ? ["deal", getDeal(numPlayers, round, seed + round)] : null,
  deal: () => ["trumpReveal", {}],
  trumpReveal: ({ trumpSuit, dealer }, { numPlayers }) =>
    trumpSuit === "w"
      ? ["select", { player: dealer }]
      : ["bid", { player: rotateIndex(numPlayers, dealer, 1) }],
  select: ({ player, dealer }, { numPlayers }, action) => {
    if (!action) return null;
    if (action.type !== "select" || action.player !== player)
      return "Action mismatch.";
    if (!["c", "d", "h", "s"].includes(action.data)) return "Invalid suit.";
    return [
      "selected",
      { trumpSuit: action.data, player: rotateIndex(numPlayers, dealer, 1) },
    ];
  },
  selected: () => ["bid", {}],
  bid: (game, { options }, action) => {
    if (!action) return null;
    if (action.type !== "bid" || action.player !== game.player)
      return "Action mismatch.";
    const bidErr = checkBid(action.data, game, options);
    if (bidErr) return bidErr;

    const bids = game.bids.map((bid, i) =>
      i === action.player ? action.data : bid
    );

    return ["bidded", { bids }];
  },
  bidded: ({ bids, player }, { numPlayers }) =>
    bids.includes(null)
      ? ["bid", { player: rotateIndex(numPlayers, player, 1) }]
      : ["bidsEnd", { player: null }],
  bidsEnd: ({ dealer }, { numPlayers }) => [
    "play",
    { player: rotateIndex(numPlayers, dealer, 1) },
  ],
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

    return ["played", { hands: nextHands, trick: nextTrick }];
  },
  played: ({ trick, player, trumpSuit, trickLeader }, { numPlayers }) =>
    trick.length < numPlayers
      ? [
          "play",
          {
            player: rotateIndex(numPlayers, player, 1),
          },
        ]
      : [
          "trickWon",
          {
            player: null,
            trickWinner: rotateIndex(
              numPlayers,
              getWinningIndex(trick, trumpSuit),
              trickLeader
            ),
          },
        ],
  trickWon: ({ hands, trickWinner, actuals }) => {
    const roundContinues = hands[0].length > 0;
    const nextActuals = actuals.map((n, idx) =>
      idx === trickWinner ? n + 1 : n
    );

    if (roundContinues) {
      return [
        "play",
        {
          actuals: nextActuals,
          trick: [],
          trickLeader: trickWinner,
          trickWinner: null,
          player: trickWinner,
        },
      ];
    }

    return ["roundEnd", { actuals: nextActuals, trick: [], trickWinner: null }];
  },
  roundEnd: (game, ctx) => {
    const { round } = game;
    const gameContinues = ctx.options.numRounds !== round;
    if (gameContinues) return getNextRound(ctx, game);

    const { scores, bids, actuals } = game;
    const nextScores = [...scores, bids, actuals] as number[][];
    return [
      "end",
      {
        scores: nextScores,
      },
    ];
  },
  end: () => true,
};

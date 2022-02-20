import type { CreateSpec, Chart, GameDefinition } from "@lib/tabletop";

import { rotateIndex } from "@lib/array";
import { getDeal, getWinningIndex } from "./logic";

export type WizardSpec = CreateSpec<{
  states:
    | "roundStart"
    | "deal"
    | "select"
    | "bid"
    | "bidsEnd"
    | "play"
    | "trickWon"
    | "tallyScores"
    | "end";
  edges: {
    roundStart: [null, "deal"];
    deal: ["select", "bid"];
    select: [null, "bid"];
    bid: [null, "bid", "bidsEnd"];
    play: [null, "play", "trickWon"];
    trickWon: ["play", "tallyScores"];
    tallyScores: ["roundStart", "end"];
    end: [true];
  };
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
  gameTypes: {
    roundStart: { player: null };
    deal: { player: null };
    select: { player: number };
    bid: { player: number };
    play: { player: number };
    trickWon: { player: null };
    tallyScores: { player: null };
    end: { player: null };
  };
  actions:
    | { type: "select"; data: string }
    | { type: "bid"; data: number }
    | { type: "play"; data: string };
  options: null;
}>;

type RoundStart = Extract<WizardSpec["gameStates"], { 0: "roundStart" }>;
const getNextRound = (
  { numPlayers }: { numPlayers: number },
  game = {} as WizardSpec["game"]
): RoundStart => {
  const dealer =
    game.dealer !== undefined ? rotateIndex(numPlayers, game.dealer) : 0;
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
      trickLeader: rotateIndex(numPlayers, dealer),
      trickWinner: null,
      bids: Array.from({ length: numPlayers }, () => null),
      actuals: Array.from({ length: numPlayers }, () => 0),
      scores,
    },
  ];
};

export const chart: Chart<WizardSpec> = {
  roundStart: ({ round }, { numPlayers, seed }) =>
    seed ? ["deal", getDeal(numPlayers, round, seed + round)] : null,
  deal: ({ trumpSuit, dealer }, { numPlayers }) =>
    trumpSuit === "w"
      ? ["select", { player: dealer }]
      : ["bid", { player: rotateIndex(numPlayers, dealer) }],
  select: ({ player, dealer }, { numPlayers }, action) => {
    if (!action) return null;
    if (action.type !== "select" || action.player !== player)
      return "Action mismatch.";
    if (!["c", "d", "h", "s"].includes(action.data)) return "Invalid suit.";
    return [
      "bid",
      { trumpSuit: action.data, player: rotateIndex(numPlayers, dealer) },
    ];
  },
  bid: (game, { numPlayers }, action) => {
    if (!action) return null;
    if (action.type !== "bid" || action.player !== game.player)
      return "Action mismatch.";
    if (action.data < 0 || action.data > game.round) return "Invalid bid.";

    const bids = game.bids.map((bid, i) =>
      i === action.player ? action.data : bid
    );

    return bids.includes(null)
      ? ["bid", { bids, player: rotateIndex(numPlayers, game.player) }]
      : ["bidsEnd", { bids, player: null }];
  },
  bidsEnd: ({ dealer }, { numPlayers }) => [
    "play",
    { player: rotateIndex(numPlayers, dealer) },
  ],
  play: (
    { player, hands, trick, trumpSuit, trickLeader },
    { numPlayers },
    action
  ) => {
    if (!action) return null;
    if (action.type !== "play" || action.player !== player)
      return "Action mismatch.";
    if (!hands[action.player].includes(action.data))
      return "You don't have that card.";

    const nextHands = hands.map((hand, i) =>
      i === action.player! ? hand.filter((card) => card !== action.data) : hand
    );
    const nextTrick = [...trick, action.data];

    return nextTrick.length < numPlayers
      ? [
          "play",
          {
            hands: nextHands,
            trick: nextTrick,
            player: rotateIndex(numPlayers, player),
          },
        ]
      : [
          "trickWon",
          {
            hands: nextHands,
            trick: nextTrick,
            player: null,
            trickWinner: rotateIndex(
              getWinningIndex(trick, trumpSuit),
              trickLeader
            ),
          },
        ];
  },
  trickWon: (state, ctx) => {
    const { hands, trickWinner, trickLeader } = state;
    const { numPlayers } = ctx;

    const roundContinues = hands[0].length > 0;
    if (roundContinues) {
      const nextTrickLeader = rotateIndex(
        numPlayers,
        trickWinner!,
        trickLeader
      );
      return [
        "play",
        {
          trickLeader: nextTrickLeader,
          player: nextTrickLeader,
        },
      ];
    }

    return ["tallyScores", { trick: [], trickWinner: null }];
  },
  tallyScores: (game, ctx) => {
    const { round } = game;
    const gameContinues = ctx.numPlayers * round !== 60;
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

export const wizardDefinition: GameDefinition<WizardSpec> = {
  setup: (ctx) => {
    const validNumPlayers = ctx.numPlayers >= 2 && ctx.numPlayers <= 6;
    return validNumPlayers ? getNextRound(ctx) : "Invalid number of players.";
  },
  chart,
  actionStubs: {
    bid: (i) => (typeof i === "string" ? parseInt(i) : i),
    play: (i) => i,
    select: (i) => i,
  },
  stripGame: (patch, player) => {
    const [state, game] = patch;
    return game.hands
      ? [
          state,
          {
            ...game,
            hands: game.hands.map((hand, idx) => (idx === player ? hand : [])),
          },
        ]
      : patch;
  },
};

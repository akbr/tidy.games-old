import type {
  // Msgs
  Err,
  // States
  Core,
  Deal,
  Seed,
  SelectTrump,
  Bid,
  BidEnd,
  Play,
  TrickEnd,
  GameEnd,
  // Actions
  SelectTrumpAction,
  BidAction,
  PlayAction,
  TurnEnd,
  ShowScores,
} from "./types";

import { rotateIndex } from "@lib/array";

import {
  getDealtCards,
  getWinningIndex,
  getPlayableCards,
  isValidBid,
} from "./logic";

export const err = (data: string): Err => ({
  type: "err",
  data,
});

export const toDeal = (s: Seed | TurnEnd): Deal => {
  const dealer = "dealer" in s ? rotateIndex(s.numPlayers, s.dealer) : 0;
  return {
    type: "deal",
    turn: "turn" in s ? s.turn + 1 : 1,
    dealer,
    activePlayer: null,
    hands: Array.from({ length: s.numPlayers }, () => []),
    trumpCard: null,
    trumpSuit: null,
    trick: [],
    trickLeader: rotateIndex(s.numPlayers, dealer),
    trickWinner: null,
    bids: Array.from({ length: s.numPlayers }, () => null) as Core["bids"],
    actuals: Array.from({ length: s.numPlayers }, () => 0),
    scores: "scores" in s ? s.scores : [],
    // Carry over
    options: s.options,
    numPlayers: s.numPlayers,
  };
};

export const onDeal = (s: Deal): SelectTrump | Bid => {
  const { hands, trumpCard, trumpSuit } = getDealtCards(s.numPlayers, s.turn);
  const trumpCardIsWizard = trumpSuit === "w";

  return {
    ...s,
    type: trumpCardIsWizard ? "selectTrump" : "bid",
    activePlayer: trumpCardIsWizard
      ? s.dealer
      : rotateIndex(s.numPlayers, s.dealer),
    hands,
    trumpCard,
    trumpSuit: trumpCardIsWizard ? null : trumpSuit,
  };
};

export const onSelectTrump = (
  s: SelectTrump,
  suit: SelectTrumpAction["data"]
): Bid | Err => {
  const isValidSuit = ["c", "d", "h", "s"].includes(suit);
  return isValidSuit
    ? {
        ...s,
        type: "bid",
        trumpSuit: suit,
        activePlayer: rotateIndex(s.numPlayers, s.dealer),
      }
    : err("Invalid suit.");
};

export const onBid = (
  s: Bid,
  bidInput: BidAction["data"]
): Bid | BidEnd | Err => {
  if (!Number.isInteger(bidInput)) {
    return err("Bid must be an integer.");
  }

  if (
    !isValidBid(bidInput, {
      canadian: s.options.canadian,
      bids: s.bids,
      turn: s.turn,
    })
  ) {
    return err("Invalid bid.");
  }

  let bids = s.bids.map((bid, i) => (i === s.activePlayer ? bidInput : bid));
  let bidsRemain = bids.includes(null);

  if (bidsRemain) {
    return {
      ...s,
      type: "bid",
      bids,
      activePlayer: rotateIndex(s.numPlayers, s.activePlayer),
    };
  }

  return {
    ...s,
    type: "bidEnd",
    bids,
    activePlayer: null,
  };
};

export const onBidEnd = (s: BidEnd): Play => ({
  ...s,
  type: "play",
  activePlayer: rotateIndex(s.numPlayers, s.dealer),
});

export const onPlay = (
  s: Play,
  cardId: PlayAction["data"]
): Play | TrickEnd | Err => {
  const cardIsInHand = s.hands[s.activePlayer].includes(cardId);
  if (!cardIsInHand)
    return err("You don't have that card! (Are you trying to cheat?).");

  const cardIsPlayable = getPlayableCards(
    s.hands[s.activePlayer],
    s.trick
  ).includes(cardId);
  if (!cardIsPlayable)
    return err("You must follow suit (or play a Wizard or Jester).");

  const nextTrick = [...s.trick, cardId];

  const nextHands = s.hands.map((hand, i) => {
    if (i !== s.activePlayer) return hand;
    return hand.filter((card) => card !== cardId);
  });

  const trickContinues = nextTrick.length !== s.numPlayers;

  if (trickContinues) {
    return {
      ...s,
      activePlayer: rotateIndex(s.numPlayers, s.activePlayer),
      hands: nextHands,
      trick: nextTrick,
    };
  }

  const winningTrickIndex = getWinningIndex(nextTrick, s.trumpSuit);

  return {
    ...s,
    type: "trickEnd",
    activePlayer: null,
    hands: nextHands,
    trick: nextTrick,
    trickWinner: rotateIndex(s.numPlayers, winningTrickIndex, s.trickLeader),
  };
};

export const onTrickEnd = (s: TrickEnd): Play | TurnEnd => {
  const turnIsOver = s.hands[0].length === 0;

  const actuals = s.actuals.map((actual, i) =>
    i === s.trickWinner ? actual + 1 : actual
  );

  return turnIsOver
    ? {
        ...s,
        type: "turnEnd",
        actuals,
        trick: [],
        trickLeader: -1,
        trickWinner: null,
      }
    : {
        ...s,
        type: "play",
        activePlayer: s.trickWinner,
        actuals,
        trick: [],
        trickLeader: s.trickWinner,
        trickWinner: null,
      };
};

export const onTurnEnd = (s: TurnEnd): ShowScores => ({
  ...s,
  type: "showScores",
});

export const onShowScores = (s: ShowScores): GameEnd | Deal => {
  const gameIsOver = s.turn * s.numPlayers === 60;
  const scores = [...s.scores, s.bids, s.actuals] as Core["scores"];

  return gameIsOver
    ? {
        ...s,
        type: "gameEnd",
        scores,
        trick: [],
        trickLeader: -1,
      }
    : toDeal({
        ...s,
        scores,
      });
};

import type { ReducerFns } from "@lib/io/engine/reducer";
import type { WizardTypes, StateGlossary } from "./types";

import { rotateIndex } from "@lib/array";
import {
  getDealtCards,
  getWinningIndex,
  getPlayableCards,
  isValidBid,
} from "./logic";

type WizardReducerFns = ReducerFns<WizardTypes>;

export const err = (data: string): WizardTypes["msgs"] => ({
  type: "err",
  data,
});

export const toDeal = (
  s: { numPlayers: number } | StateGlossary["deal"]
): WizardTypes["states"] => {
  const dealer = "dealer" in s ? rotateIndex(s.numPlayers, s.dealer) : 0;
  return {
    type: "deal",
    data: {
      turn: "turn" in s ? s.turn + 1 : 1,
      dealer,
      activePlayer: null,
      hands: Array.from({ length: s.numPlayers }, () => []),
      trumpCard: null,
      trumpSuit: null,
      trick: [],
      trickLeader: rotateIndex(s.numPlayers, dealer),
      trickWinner: null,
      bids: Array.from({ length: s.numPlayers }, () => null),
      actuals: Array.from({ length: s.numPlayers }, () => 0),
      scores: "scores" in s ? s.scores : [],
      // Carry over
      options: { canadian: false },
      numPlayers: s.numPlayers,
    },
  };
};

export const reducerFns: WizardReducerFns = {
  deal: ({ data }) => {
    const cards = getDealtCards(data.numPlayers, data.turn);
    const trumpCardIsWizard = cards.trumpSuit === "w";
    return {
      type: trumpCardIsWizard ? "selectTrump" : "bid",
      data: {
        ...data,
        activePlayer: trumpCardIsWizard
          ? data.dealer
          : rotateIndex(data.numPlayers, data.dealer),
        ...cards,
      },
    };
  },
  selectTrump: (s, a) => {
    if (!a) return s;
    if (!(a.type === s.type && s.data.activePlayer === a.playerIndex))
      return err("Mismatched action");

    const suit = a.data;
    const isValidSuit = ["c", "d", "h", "s"].includes(suit);
    return isValidSuit
      ? {
          type: "bid",
          data: {
            ...s.data,
            trumpSuit: suit,
            activePlayer: rotateIndex(s.data.numPlayers, s.data.dealer),
          },
        }
      : err("Invalid suit.");
  },
  bid: (s, a) => {
    if (!a) return s;
    if (!(a.type === s.type && s.data.activePlayer === a.playerIndex))
      return err("Mismatched action");
    const bidInput = a.data;

    if (!Number.isInteger(bidInput)) {
      return err("Bid must be an integer.");
    }

    if (
      !isValidBid(bidInput, {
        canadian: s.data.options.canadian,
        bids: s.data.bids,
        turn: s.data.turn,
      })
    ) {
      return err("Invalid bid.");
    }

    const bids = s.data.bids.map((bid, i) =>
      i === s.data.activePlayer ? bidInput : bid
    );
    const bidsRemain = bids.includes(null);

    if (bidsRemain) {
      return {
        type: "bid",
        data: {
          ...s.data,
          bids,
          activePlayer: rotateIndex(s.data.numPlayers, s.data.activePlayer),
        },
      };
    }

    return {
      type: "bidEnd",
      data: {
        ...s.data,
        bids,
        activePlayer: null,
      },
    };
  },
  bidEnd: ({ data }) => ({
    type: "play",
    data: {
      ...data,
      activePlayer: rotateIndex(data.numPlayers, data.dealer),
    },
  }),
  play: (s, a) => {
    if (!a) return s;
    if (!(a.type === s.type && s.data.activePlayer === a.playerIndex))
      return err("Mismatched action");

    const cardId = a.data;
    const { data } = s;

    const cardIsInHand = data.hands[data.activePlayer].includes(cardId);
    if (!cardIsInHand)
      return err("You don't have that card! (Are you trying to cheat?).");

    const cardIsPlayable = getPlayableCards(
      data.hands[data.activePlayer],
      data.trick
    ).includes(cardId);
    if (!cardIsPlayable)
      return err("You must follow suit (or play a Wizard or Jester).");

    const nextTrick = [...data.trick, cardId];

    const nextHands = data.hands.map((hand, i) => {
      if (i !== data.activePlayer) return hand;
      return hand.filter((card) => card !== cardId);
    });

    const trickContinues = nextTrick.length !== data.numPlayers;

    if (trickContinues) {
      return {
        type: "play",
        data: {
          ...data,
          activePlayer: rotateIndex(data.numPlayers, data.activePlayer),
          hands: nextHands,
          trick: nextTrick,
        },
      };
    }

    const winningTrickIndex = getWinningIndex(nextTrick, data.trumpSuit);

    return {
      type: "trickEnd",
      data: {
        ...data,
        activePlayer: null,
        hands: nextHands,
        trick: nextTrick,
        trickWinner: rotateIndex(
          data.numPlayers,
          winningTrickIndex,
          data.trickLeader
        ),
      },
    };
  },
  trickEnd: ({ data }) => {
    const turnIsOver = data.hands[0].length === 0;
    const actuals = data.actuals.map((actual, i) =>
      i === data.trickWinner ? actual + 1 : actual
    );

    return turnIsOver
      ? {
          type: "turnEnd",
          data: {
            ...data,
            actuals,
            trick: [],
            trickLeader: -1,
            trickWinner: null,
          },
        }
      : {
          type: "play",
          data: {
            ...data,
            activePlayer: data.trickWinner,
            actuals,
            trick: [],
            trickLeader: data.trickWinner,
            trickWinner: null,
          },
        };
  },
  turnEnd: ({ data }) => ({
    type: "showScores",
    data,
  }),
  showScores: ({ data }) => {
    const gameIsOver = data.turn * data.numPlayers === 60;
    const scores = [...data.scores, data.bids, data.actuals] as number[][];

    return gameIsOver
      ? {
          type: "gameEnd",
          data: {
            ...data,
            scores,
            trick: [],
            trickLeader: -1,
          },
        }
      : toDeal({
          ...data,
          scores,
        });
  },
  gameEnd: (s) => s,
  err: (s) => s,
};

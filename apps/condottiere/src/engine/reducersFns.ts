import type { ReducerFns } from "@lib/io/engine/reducer";
import type { Cities, CondottiereTypes } from "./types";

import { removeOne, rotateIndex } from "@lib/array";
import {
  canDiscard,
  createHands,
  sortHand,
  createMap,
  getBattleStatus,
  getNextPlayer,
  isWinner,
} from "./logic";

type CondottiereReducerFns = ReducerFns<CondottiereTypes>;

type StateType<T extends string> = Extract<
  CondottiereTypes["states"],
  { type: T }
>;

export const startRound = (
  data:
    | { numPlayers: number; seed?: string }
    | StateType<"discardResults">["data"]
): StateType<"deal"> => {
  const round = "round" in data ? data.round + 1 : 1;
  const map = "map" in data ? data.map : createMap();
  const condottiere = "condottiere" in data ? data.condottiere : 0;
  const nextSeed = data.seed ? data.seed + round : undefined;

  return {
    type: "deal",
    data: {
      round,
      numPlayers: data.numPlayers,
      condottiere,
      activePlayer: condottiere,
      map,
      hands: createHands(data.numPlayers, map, nextSeed),
      lines: Array.from({ length: data.numPlayers }).map(() => []),
      status: Array.from({ length: data.numPlayers }).map(() => true),
      msg: null,
      seed: data.seed,
    },
  };
};

const playedOrRetreated = (
  s: StateType<"played"> | StateType<"retreated">
): StateType<"play"> | StateType<"battleEnd"> => {
  const battleStatus = getBattleStatus(s.data.lines, s.data.status);

  if (battleStatus === undefined) {
    return {
      type: "play",
      data: {
        ...s.data,
        activePlayer: getNextPlayer(s.data.activePlayer!, s.data.status),
        msg: null,
      },
    };
  }

  const isTied = battleStatus === -1;
  const city = Object.entries(s.data.map).find(
    ([_, status]) => status === -1
  )![0];

  return {
    type: "battleEnd",
    data: {
      ...s.data,
      msg: [battleStatus, city] as [number, Cities],
      map: { ...s.data.map, [city]: isTied ? null : battleStatus },
      condottiere: isTied
        ? rotateIndex(s.data.numPlayers, s.data.condottiere)
        : battleStatus,
    },
  };
};

export const reducerFns: CondottiereReducerFns = {
  deal: (s) => ({
    type: "choose",
    data: {
      ...s.data,
      activePlayer: s.data.condottiere,
    },
  }),
  choose: (s, a) => {
    if (!a) return s;
    if (!(a.type === s.type && a.playerIndex === s.data.activePlayer))
      return { type: "err", data: "Wrong action type or it's not your turn." };

    const city = a.data;

    return s.data.map[city] !== null
      ? { type: "err", data: "This city has already been conquered." }
      : {
          type: "chosen",
          data: {
            ...s.data,
            map: { ...s.data.map, [city]: -1 },
            msg: city,
          },
        };
  },
  chosen: (s) => ({
    type: "play",
    data: {
      ...s.data,
      activePlayer: s.data.condottiere,
      msg: null,
    },
  }),
  play: (s, a) => {
    if (!a) return s;
    if (!(a.type === s.type && a.playerIndex === s.data.activePlayer))
      return { type: "err", data: "Wrong action type or it's not your turn." };

    const { activePlayer } = s.data;
    const order = a.data;

    if (order === false) {
      return {
        type: "played",
        data: {
          ...s.data,
          status: s.data.status.map((status, idx) =>
            idx === activePlayer ? false : status
          ),
          msg: order,
        },
      };
    }

    if (!s.data.hands[activePlayer!].includes(order))
      return { type: "err", data: "You don't have that card." };

    const hands = s.data.hands.map((hand, idx) =>
      idx === activePlayer ? removeOne(hand, order) : hand
    );
    const lines = s.data.lines.map((line, idx) =>
      idx === activePlayer ? [...line, order] : line
    );
    const scarecrowPlayed = order === "s";

    if (scarecrowPlayed) {
      return {
        type: "retreat",
        data: {
          ...s.data,
          hands,
          lines,
        },
      };
    }

    return {
      type: "played",
      data: {
        ...s.data,
        hands,
        lines,
        msg: order,
      },
    };
  },
  played: playedOrRetreated,
  retreat: (s, a) => {
    if (!a) return s;
    const validAction =
      a.type === s.type && a.playerIndex === s.data.activePlayer;
    if (!validAction)
      return { type: "err", data: "Wrong action type or it's not your turn." };

    const order = a.data;
    const { lines, activePlayer, hands } = s.data;
    const nextLines =
      order === false
        ? lines
        : lines.map((line, idx) =>
            idx === activePlayer ? removeOne(line, order) : line
          );
    const nextHands =
      order === false
        ? hands
        : hands.map((hand, idx) =>
            idx === activePlayer ? sortHand([...hand, order]) : hand
          );

    return {
      type: "retreated",
      data: {
        ...s.data,
        lines: nextLines,
        hands: nextHands,
        msg: order,
      },
    };
  },
  retreated: playedOrRetreated,
  battleEnd: (s) => {
    const winningIndex = isWinner(s.data.map, s.data.numPlayers);

    if (winningIndex !== null) {
      return {
        type: "gameEnd",
        data: {
          ...s.data,
          msg: winningIndex,
        },
      };
    }

    return {
      type: "discard",
      data: {
        ...s.data,
        activePlayer: -1,
        lines: s.data.lines.map(() => []),
        status: Array.from({ length: s.data.numPlayers }).map(() => null),
        msg: null,
      },
    };
  },
  discard: (s, a) => {
    if (!a) return s;
    if (a.type !== s.type) return { type: "err", data: "Wrong action type." };

    if (a.data === true && !canDiscard(s.data.hands[a.playerIndex]))
      return { type: "err", data: "You have mercanies in your hand." };

    const status = s.data.status!.map((status, idx) =>
      idx === a.playerIndex ? a.data : status
    );
    const discardsComplete = !status.includes(null);

    return {
      type: discardsComplete ? "discardResults" : "discard",
      data: {
        ...s.data,
        status,
      },
    };
  },
  discardResults: (s) => {
    const didDiscard = (idx: number) => s.data.status[idx];
    const hands = s.data.hands.map((hand, idx) =>
      didDiscard(idx) ? [] : hand
    );

    const numPlayersRemaining = hands
      .map((hand) => (hand.length > 0 ? 1 : 0) as number)
      .reduce((a, b) => a + b, 0);

    if (numPlayersRemaining > 1) {
      return {
        type: "choose",
        data: {
          ...s.data,
          activePlayer: s.data.condottiere,
          hands,
          status: hands.map((hand) => hand.length > 0),
        },
      };
    }

    return startRound(s.data);
  },
  gameEnd: (s) => s,
  err: (s) => s,
};

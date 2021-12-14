import type { CondottiereTypes, CondottiereReducerFns } from "./types";
import { removeOne, rotateIndex } from "@lib/array";
import {
  canDiscard,
  createHands,
  createMap,
  getBattleStatus,
  getNextPlayer,
  isWinner,
} from "./logic";

type StateType<T extends string> = Extract<
  CondottiereTypes["states"],
  { type: T }
>;

export const startRound = (
  data: { numPlayers: number } | StateType<"discardResults">["data"]
): StateType<"deal"> => {
  const map = "map" in data ? data.map : createMap();

  return {
    type: "deal",
    data: {
      round: "round" in data ? data.round + 1 : 1,
      numPlayers: data.numPlayers,
      condotierre: "condotierre" in data ? data.condotierre : 0,
      activePlayer: null,
      map,
      hands: createHands(data.numPlayers, map),
      lines: Array.from({ length: data.numPlayers }).map(() => []),
      playStatus: Array.from({ length: data.numPlayers }).map(() => true),
      discardStatus: null,
      retreatStatus: null,
      winner: null,
    },
  };
};

const playedOrRetreated = (
  s: StateType<"played"> | StateType<"retreated">
): StateType<"play"> | StateType<"battleEnd"> => {
  const battleStatus = getBattleStatus(s.data.lines, s.data.playStatus);

  if (battleStatus === undefined) {
    return {
      type: "play",
      data: {
        ...s.data,
        activePlayer: getNextPlayer(s.data.activePlayer!, s.data.playStatus),
        retreatStatus: null,
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
      winner: battleStatus,
      map: { ...s.data.map, [city]: isTied ? null : battleStatus },
      condotierre: isTied
        ? rotateIndex(s.data.numPlayers, s.data.condotierre)
        : battleStatus,
      activePlayer: null,
      retreatStatus: null,
    },
  };
};

export const reducerFns: CondottiereReducerFns = {
  deal: (s) => ({
    type: "choose",
    data: {
      ...s.data,
      activePlayer: s.data.condotierre,
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
            activePlayer: null,
          },
        };
  },
  chosen: (s) => ({
    type: "play",
    data: {
      ...s.data,
      activePlayer: s.data.condotierre,
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
          playStatus: s.data.playStatus.map((status, idx) =>
            idx === activePlayer ? false : status
          ),
          activePlayer: null,
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
        activePlayer: null,
        hands,
        lines,
      },
    };
  },
  played: playedOrRetreated,
  retreat: (s, a) => {
    const validAction =
      a && a.type === s.type && a.playerIndex === s.data.activePlayer;
    if (!validAction)
      return { type: "err", data: "Wrong action type or it's not your turn." };

    const order = a.data;
    const { lines, activePlayer } = s.data;

    return {
      type: "retreated",
      data: {
        ...s.data,
        lines:
          order === false
            ? lines
            : lines.map((line, idx) =>
                idx === activePlayer ? removeOne(line, order) : line
              ),
        retreatStatus: order,
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
          activePlayer: null,
          winner: winningIndex,
        },
      };
    }

    return {
      type: "discard",
      data: {
        ...s.data,
        activePlayer: -1,
        discardStatus: Array.from({ length: s.data.numPlayers }).map(
          () => null
        ),
        winner: null,
      },
    };
  },
  discard: (s, a) => {
    if (!a) return s;
    if (!(a.type === s.type && a.playerIndex === s.data.activePlayer))
      return { type: "err", data: "Wrong action type or it's not your turn." };

    if (a.data === true && !canDiscard(s.data.hands[a.playerIndex]))
      return { type: "err", data: "You have mercanies in your hand." };

    const status = s.data.discardStatus!.map((status, idx) =>
      idx === a.playerIndex ? a.data : status
    );
    const discardsComplete = !status.includes(null);

    return {
      type: discardsComplete ? "discardResults" : "discard",
      data: {
        ...s.data,
        discardStatus: status,
      },
    };
  },
  discardResults: (s) => {
    const didDiscard = (idx: number) => s.data.discardStatus![idx];
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
          activePlayer: s.data.condotierre,
          hands,
          playStatus: hands.map((hand) => hand.length > 0),
          discardResults: null,
        },
      };
    }

    return startRound(s.data);
  },
  gameEnd: (s) => s,
  err: (s) => s,
};

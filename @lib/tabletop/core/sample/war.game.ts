import type { CreateSpec } from "../spec";
import type { Game } from "../game";
import { randomIntBetween } from "@lib/random";
import { withAction } from "../reducer";

export type WarSpec = CreateSpec<{
  phases: "start" | "deal" | "play" | "played" | "end";
  board: {
    activePlayer: number | null;
    hands: number[][];
    table: number[];
  };
  actions: { type: "play"; data: number };
}>;

const getInitialBoard: Game<WarSpec>["getInitialBoard"] = ({ numPlayers }) => ({
  phase: "start",
  activePlayer: null,
  hands: Array.from({ length: numPlayers }).map(() => []),
  table: [],
  scores: [],
});

const reducer: Game<WarSpec>["reducer"] = {
  start: (g) => ({ ...g, phase: "deal" }),
  deal: (g, { seed }) => {
    const hands = g.hands.map((hand, idx) => [
      randomIntBetween(0, 3, seed + idx),
    ]);
    return { ...g, phase: "play", hands, activePlayer: 0 };
  },
  play: withAction(
    (a, g) => {
      if (a.player !== g.activePlayer) return "Not your turn!";
      if (g.hands[a.player].indexOf(a.data) === -1)
        return "You don't have that number!";
      return a;
    },
    (g, a) => {
      const table = [...g.table, a.data];
      const hands = g.hands.map((hand, idx) => {
        if (idx !== a.player) return hand;
        return hand.filter((x) => x !== a.data);
      });
      return { ...g, phase: "played", table, hands };
    }
  ),
  played: (g, { numPlayers }) => {
    if (g.activePlayer === numPlayers - 1)
      return { ...g, phase: "end", activePlayer: null };
    return { ...g, phase: "play", activePlayer: g.activePlayer! + 1 };
  },
  end: () => true,
};

export const warGame: Game<WarSpec> = {
  meta: {
    name: "War",
    players: [2, 4],
  },
  getOptions: () => null,
  getInitialBoard,
  reducer,
  adjustBoard: (g, player) => {
    const strippedHands = g.hands.map((val, i) => (i === player ? val : []));
    return { ...g, hands: strippedHands };
  },
  actionKeys: {
    play: null,
  },
};

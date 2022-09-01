import type { CreateSpec } from "../spec";
import type { Cart } from "../cart";
import { randomIntBetween } from "@lib/random";

export type WarSpec = CreateSpec<{
  phases: "start" | "deal" | "play" | "played" | "end";
  game: {
    activePlayer: number | null;
    hands: number[][];
    table: number[];
  };
  actions: { type: "play"; data: number };
}>;

const getInitialState: Cart<WarSpec>["getInitialState"] = ({ numPlayers }) => ({
  phase: "start",
  activePlayer: null,
  hands: Array.from({ length: numPlayers }).map(() => []),
  table: [],
  scores: [],
});

const chart: Cart<WarSpec>["chart"] = {
  start: (s, c, a) => ({ phase: "deal" }),
  deal: (s, { numPlayers, seed }) => {
    const hands = s.hands.map((hand, idx) => [
      randomIntBetween(0, 3, seed + idx),
    ]);
    return { phase: "play", hands, activePlayer: 0 };
  },
  play: (s, c, a) => {
    if (!a) return null;
    if (a.player !== s.activePlayer) return "Not your turn!";
    if (s.hands[a.player].indexOf(a.data) === -1)
      return "You don't have that number!";
    const table = [...s.table, a.data];
    const hands = s.hands.map((hand, idx) => {
      if (idx !== a.player) return hand;
      return hand.filter((x) => x !== a.data);
    });
    return { phase: "played", table, hands };
  },
  played: (s, { numPlayers }) => {
    if (s.activePlayer === numPlayers - 1)
      return { phase: "end", activePlayer: null };
    return { phase: "play", activePlayer: (s.activePlayer! += 1) };
  },
  end: () => true,
};

export const warCart: Cart<WarSpec> = {
  meta: {
    name: "War",
    players: [2, 4],
  },
  getOptions: () => null,
  getInitialState,
  chart,
  adjustState: (state, player, patch) => {
    if (patch.hands) {
      const strippedHands = patch.hands.map((val, i) =>
        i === player ? val : []
      );
      return { hands: strippedHands };
    }
  },
  actionKeys: {
    play: null,
  },
};

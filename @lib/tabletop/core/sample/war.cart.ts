import type { CreateSpec } from "../spec";
import type { Cart } from "../cart";
import { randomIntBetween } from "@lib/random";
import { is } from "@lib/compare/is";

export type WarSpec = CreateSpec<{
  phases: "start" | "deal" | "play" | "played" | "end";
  game: {
    activePlayer: number | null;
    hands: number[];
    table: number[];
  };
  actions: { type: "play"; data: number };
  transitions: {
    start: "deal";
    deal: "play";
    play: null | "played";
    played: "play" | "end";
    end: true;
  };
  constraints: {
    start: { activePlayer: null };
    deal: { activePlayer: null };
    play: { activePlayer: number };
    played: { activePlayer: number };
    end: { activePlayer: null };
  };
}>;

const getInitialState: Cart<WarSpec>["getInitialState"] = ({ numPlayers }) => ({
  phase: "start",
  activePlayer: null,
  hands: [],
  table: [],
  scores: [],
});

const chart: Cart<WarSpec>["chart"] = {
  start: (s, c, a) => ({ phase: "deal" }),
  deal: (s, { numPlayers, seed }) => {
    const hands = Array.from({ length: numPlayers }).map((_, idx) =>
      randomIntBetween(0, 3, seed + idx)
    );
    return { phase: "play", hands, activePlayer: 0 };
  },
  play: (s, c, a) => {
    if (!a) return null;
    if (a.player !== s.activePlayer) return "Not your turn!";
    if (s.hands[a.player] !== a.data) return "You don't have that number!";
    const table = [...s.table, a.data];
    return { phase: "played", table };
  },
  played: (s, { numPlayers }) => {
    if (s.activePlayer === numPlayers - 1)
      return { phase: "end", activePlayer: null };
    return { phase: "play", activePlayer: (s.activePlayer += 1) };
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
  stripState: (patch, player) => {
    const { hands } = patch;
    if (!is.defined(hands)) return patch;
    if (hands.length === 0) return patch;

    const strippedHands = hands.map((val, i) => (i === player ? val : -1));
    return { ...patch, hands: strippedHands };
  },
  actionKeys: {
    play: null,
  },
};

import { CreateSpec } from "./spec";
import { Cart } from "./cart";

type SimpleSpec = CreateSpec<{
  phases: "start" | "playing" | "end";
  game: { count: number };
  actions: { type: "add"; data: number } | { type: "sub"; data: number };
  transitions: {
    start: "playing";
    playing: null | "playing" | "end";
    end: true;
  };
  constraints: {
    end: { count: 100 };
  };
}>;

type SimpleCart = Cart<SimpleSpec>;

const cart: SimpleCart = {
  meta: {
    name: "Simple",
    players: [1, 1],
  },
  chart: {
    start: () => ["playing", {}],
    playing: ({ count }, { options, seed, numPlayers }, action) => {
      if (!action) return null;

      const { type, data: num } = action;
      if (num < 0) return "Can't submit negative numbers.";

      const nextCount = type === "add" ? count + num : count - num;

      if (nextCount !== 100) return ["playing", { count: nextCount }];
      return ["end", { count: nextCount }];
    },
    end: () => true,
  },
  setup: () => ["playing", { count: 0 }],
  setOptions: () => null,
  actionStubs: {
    add: null,
    sub: null,
  },
  botFn: ({ state, ctx, player }, send) => {},
};

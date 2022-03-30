import { CreateSpec } from "./spec";
import { Cart } from "./cart";

type SimpleSpec = CreateSpec<{
  states: "start" | "end";
  game: { count: number };
  actions: { type: "add"; data: number } | { type: "sub"; data: number };
  edges: {
    end: true;
  };
  gameExtends: {
    end: { count: -1 };
  };
}>;

const cart: Cart<SimpleSpec> = {
  meta: {
    name: "Simple",
    players: [1, 1],
  },
  chart: {
    start: ({ count }, { options, seed, numPlayers }, action) => {
      return ["end", { count: -1 }];
    },
    end: ({ count }) => {
      return true;
    },
  },
  setup: () => ["start", { count: 0 }],
  setOptions: () => null,
  actionStubs: {
    add: null,
    sub: null,
  },
  botFn: ([state, game], player) => {},
};

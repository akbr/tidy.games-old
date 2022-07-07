import type { CreateSpec } from "../spec";
import type { Chart } from "../chart";
import type { Cart } from "../cart";

// 1. Create a specification

type NumberWarSpec = CreateSpec<{
  phases: "start" | "waiting" | "played" | "victory" | "tie" | "end";
  game: {
    activePlayer: number | null;
    field: (number | null)[];
    scores: number[];
    winner: number | null;
  };
  options: {
    targetScore: number;
  };
  actions: { type: "play"; data: number };
  transitions: {
    start: "waiting";
    waiting: null | "played";
    played: "victory" | "tie";
    victory: "waiting" | "end";
    tie: "waiting";
    end: true;
  };
}>;

// 2. Create cart components
type NumberWarCart = Cart<NumberWarSpec>;

// Metadata
const meta: NumberWarCart["meta"] = {
  name: "Number War!",
  players: [2, 4],
};

// Options config
const defaultOptions = { targetScore: 3 };
const maxScore = 99;
const getOptions: Cart<NumberWarSpec>["getOptions"] = (numPlayers, options) => {
  if (!options) return defaultOptions;
  const { targetScore } = options;
  const isValid = targetScore > 0 && targetScore <= maxScore;
  return isValid ? options : defaultOptions;
};

const getInitialState: Cart<NumberWarSpec>["getInitialState"] = ({
  numPlayers,
}) => [
  "start",
  {
    activePlayer: null,
    field: Array.from({ length: numPlayers }).map((x) => null),
    scores: Array.from({ length: numPlayers }).map((x) => 0),
    winner: null,
  },
];

const chart: Chart<NumberWarSpec> = {
  start: () => ["waiting", { activePlayer: 0 }],
  waiting: ({ field, activePlayer }, ctx, action) => {
    if (!action) return null;
    const nextField = field.map((v, i) =>
      i === activePlayer ? action.data : v
    );
    return [
      "played",
      {
        field: nextField,
        activePlayer: null,
      },
    ];
  },
  played: ({ field }) => {
    const max = Math.max(
      ...(field.filter((x) => (typeof x === "number" ? x : 0)) as number[])
    );
    const isTie = field.filter((x) => x === max).length > 1;
    if (isTie) return ["tie", {}];
    return ["victory", {}];
  },
  victory: ({ scores }, { options: { targetScore } }) => {
    const max = Math.max(...scores);
    if (max === targetScore) return ["end", { winner: 0 }];
    return ["waiting", { activePlayer: 0 }];
  },
  tie: () => ["waiting", { activePlayer: 0 }],
  end: () => true,
};

// 3. Put it all together in a cart

export const numberWarCart: Cart<NumberWarSpec> = {
  meta,
  getOptions,
  getInitialState,
  chart,
};

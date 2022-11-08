import { is } from "@lib/compare/is";
import type { Spec } from "./spec";

export type Ctx<S extends Spec> = {
  numPlayers: number;
  options: S["options"];
  seed: string;
};

export type AuthAction<S extends Spec> = S["actions"] & {
  player: number;
};

export type NonStateReturns = true | string;

export type EntryReturn<S extends Spec> =
  | S["game"]
  | S["game"][]
  | NonStateReturns;

export type NoActionEntry<S extends Spec, Game extends S["game"]> = (
  game: Readonly<Game>,
  ctx: Ctx<S>
) => EntryReturn<S>;

export type ActionEntry<S extends Spec, Game extends S["game"]> = {
  fn: (
    action: Readonly<AuthAction<S>>,
    game: Readonly<Game>,
    ctx: Ctx<S>
  ) => EntryReturn<S>;
};

export function withAction<
  S extends Spec,
  G extends S["game"],
  A extends AuthAction<S>
>(
  actionFn: (action: AuthAction<S>, game: G, ctx: Ctx<S>) => A | string,
  entryFn: (game: G, action: A, ctx: Ctx<S>) => EntryReturn<S>
) {
  const result: ActionEntry<S, G> = {
    fn: (a, g, c) => {
      const actionOrError = actionFn(a, g, c);
      if (typeof actionOrError === "string") return actionOrError;
      return entryFn(g, actionOrError, c);
    },
  };
  return result;
}

export type Chart<S extends Spec> = Partial<{
  [Phase in S["game"]["phase"]]:
    | NoActionEntry<S, Extract<S["game"], { phase: Phase }>>
    | ActionEntry<S, Extract<S["game"], { phase: Phase }>>;
}>;

export type ChartUpdate<S extends Spec> = {
  games: S["game"][];
  final: boolean;
};

export function getChartUpdate<S extends Spec>(
  chart: Chart<S>,
  ctx: Ctx<S>,
  inputGame: S["game"],
  action?: AuthAction<S>
): ChartUpdate<S> | string {
  const games: S["game"][] = [];

  let final = false;
  let iterarting = true;

  while (iterarting) {
    const priorGame = games.at(-1) || inputGame;
    const phase = priorGame.phase as S["game"]["phase"];

    const chartFn = chart[phase];

    if (!chartFn) {
      return `No entry point for phase "${phase}".`;
    }

    let result: EntryReturn<S>;

    if (typeof chartFn === "function") {
      if (action) return `Phase ${phase} does not accept actions.`;
      result = chartFn(priorGame as any, ctx);
    } else {
      if (!action) {
        iterarting = false;
        continue;
      }

      result = chartFn.fn(action, priorGame as any, ctx);
    }

    action = undefined;

    if (is.string(result)) return result;

    if (result === true) {
      iterarting = false;
      final = true;
      continue;
    }

    const game = result;
    if (Array.isArray(game)) {
      games.push(...game);
    } else {
      games.push(game);
    }
  }

  return {
    games,
    final,
  };
}

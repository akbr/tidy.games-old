import type { Spec } from "./spec";

export type Ctx<S extends Spec> = {
  numPlayers: number;
  options: S["options"];
  seed: string;
};

export type AuthAction<S extends Spec> = S["actions"] & {
  player: number;
  time: number;
};

export type NonStateReturns = true | string;

export type EntryReturn<S extends Spec> =
  | S["board"]
  | S["board"][]
  | NonStateReturns;

export type NoActionEntry<S extends Spec, Board extends S["board"]> = (
  board: Readonly<Board>,
  ctx: Ctx<S>
) => EntryReturn<S>;

export type ActionEntry<S extends Spec, Board extends S["board"]> = {
  fn: (
    action: Readonly<AuthAction<S>>,
    game: Readonly<Board>,
    ctx: Ctx<S>
  ) => EntryReturn<S>;
};

export function withAction<
  S extends Spec,
  Board extends S["board"],
  A extends AuthAction<S>
>(
  actionFn: (action: AuthAction<S>, board: Board, ctx: Ctx<S>) => A | string,
  entryFn: (board: Board, action: A, ctx: Ctx<S>) => EntryReturn<S>
) {
  const result: ActionEntry<S, Board> = {
    fn: (a, b, c) => {
      const result = actionFn(a, b, c);
      if (typeof result === "string") return result;
      return entryFn(b, result, c);
    },
  };
  return result;
}

export type Reducer<S extends Spec> = Partial<{
  [Phase in S["board"]["phase"]]:
    | NoActionEntry<S, Extract<S["board"], { phase: Phase }>>
    | ActionEntry<S, Extract<S["board"], { phase: Phase }>>;
}>;

export type ReducerUpdate<S extends Spec> = {
  boardSet: S["board"][];
  final: boolean;
};

export function getReducerUpdate<S extends Spec>(
  reducer: Reducer<S>,
  ctx: Ctx<S>,
  inputBoard: S["board"],
  action?: AuthAction<S>
): ReducerUpdate<S> | string {
  const boardSet: S["board"][] = [];

  let final = false;
  let iterarting = true;

  while (iterarting) {
    const priorGame = boardSet.at(-1) || inputBoard;
    const phase = priorGame.phase as S["board"]["phase"];

    const chartFn = reducer[phase];

    if (!chartFn) {
      return `No reducer entry point for phase "${phase}".`;
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

    if (typeof result === "string") return result;

    if (result === true) {
      iterarting = false;
      final = true;
      continue;
    }

    const game = result;
    if (Array.isArray(game)) {
      boardSet.push(...game);
    } else {
      boardSet.push(game);
    }
  }

  return {
    boardSet,
    final,
  };
}

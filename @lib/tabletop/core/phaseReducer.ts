import type { Spec } from "./spec";
import type { Ctx, Reducer, PlayerAction } from "./game";

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
    action: Readonly<PlayerAction<S>>,
    game: Readonly<Board>,
    ctx: Ctx<S>
  ) => EntryReturn<S>;
};

export function withAction<
  S extends Spec,
  Board extends S["board"],
  A extends PlayerAction<S>
>(
  actionFn: (action: PlayerAction<S>, board: Board, ctx: Ctx<S>) => A | string,
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

export type PhasedReducerDefinition<S extends Spec> = Partial<{
  [Phase in S["board"]["phase"]]:
    | NoActionEntry<S, Extract<S["board"], { phase: Phase }>>
    | ActionEntry<S, Extract<S["board"], { phase: Phase }>>;
}>;

export function createPhaseReducer<S extends Spec>(
  reduferDef: PhasedReducerDefinition<S>
): Reducer<S> {
  return function reducer(lastBoard, ctx, action) {
    const boards: S["board"][] = [];
    let final = false;
    let iterarting = true;

    while (iterarting) {
      const mostRecentBoard = boards.at(-1) || lastBoard;
      const phase = mostRecentBoard.phase as S["board"]["phase"];

      const phaseFn = reduferDef[phase];
      if (!phaseFn) {
        return `No reducer entry point for phase "${phase}".`;
      }

      let result: EntryReturn<S>;

      if (typeof phaseFn === "function") {
        if (action) return `Phase ${phase} does not accept actions.`;
        result = phaseFn(mostRecentBoard as any, ctx);
      } else {
        if (!action) {
          iterarting = false;
          continue;
        }

        result = phaseFn.fn(action, mostRecentBoard as any, ctx);
      }

      action = undefined;

      if (typeof result === "string") return result;

      if (result === true) {
        iterarting = false;
        final = true;
        continue;
      }

      const board = result;
      if (Array.isArray(board)) {
        boards.push(...board);
      } else {
        boards.push(board);
      }
    }

    return {
      boards,
      final,
    };
  };
}

export default createPhaseReducer;

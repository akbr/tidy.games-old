import { is } from "@lib/compare";
import type { Spec } from "./spec";
import { AuthAction, Ctx, getReducerUpdate, ReducerUpdate } from "./reducer";
import { Game } from "./game";
import { l } from "vitest/dist/index-5f09f4d0";

export type GameUpdate<S extends Spec> = {
  prevBoard: S["board"];
  action?: AuthAction<S>;
  boardSet: S["board"][];
  final: boolean;
  ctx: Ctx<S>;
};

export type History<S extends Spec> = {
  startTime: number;
  ctx: Ctx<S>;
  actions: AuthAction<S>[];
};

export type HistoryResults<S extends Spec> = {
  boardSets: S["board"][][];
  final: boolean;
};

export type FullHistory<S extends Spec> = History<S> & HistoryResults<S>;

export type GameStore<S extends Spec> = {
  get: (player?: number) => GameUpdate<S>;
  submit: (action: S["actions"], player: number) => string | void;
  getHistory: () => History<S>;
};

type InputCtx<S extends Spec> = {
  numPlayers: number;
  options?: Ctx<S>["options"];
  seed?: Ctx<S>["seed"];
};

export function getHistoryResults<S extends Spec>(
  game: Game<S>,
  history: History<S>
): HistoryResults<S> | string {
  const { ctx, actions } = history;

  const initialBoard = game.getInitialBoard(ctx);
  if (is.string(initialBoard)) return initialBoard;

  const initialUpdate = getReducerUpdate(game.reducer, ctx, initialBoard);
  if (is.string(initialUpdate))
    return `Error on initialUpdate: ${initialUpdate}`;

  const boardSets = [[initialBoard, ...initialUpdate.boardSet]];
  let final = initialUpdate.final;
  const actionQueue = [...actions];
  while (actionQueue.length > 0) {
    const action = actionQueue.shift()!;
    const prevBoard = boardSets.at(-1)!.at(-1)!;
    const res = getReducerUpdate(game.reducer, ctx, prevBoard, action);
    if (is.string(res)) return res;
    if (res.final && actionQueue.length > 0) return `Premtature final`;
    final = res.final;
    boardSets.push(res.boardSet);
  }

  return {
    boardSets,
    final,
  };
}

export function createGameStore<S extends Spec>(
  game: Game<S>,
  initCtx: InputCtx<S>,
  initActions?: AuthAction<S>[]
): GameStore<S> | string {
  const ctx = validateContext(game, initCtx);
  if (is.string(ctx)) return ctx;

  let actions: AuthAction<S>[] = initActions ? [...initActions] : [];
  let startTime = Date.now();
  let historyResults = getHistoryResults(game, {
    startTime,
    ctx,
    actions,
  });

  if (is.string(historyResults)) return historyResults;

  let final = historyResults.final;
  let boardSet = historyResults.boardSets.at(-1)!;

  //@ts-ignore
  historyResults = null; // Garbage collection

  return {
    get: (player = -1) => {
      const { adjustBoard, adjustAction } = game;
      const prevBoard = boardSet.at(-1)!;
      const lastAction = actions.at(-1);

      const adjPrevBoard = adjustBoard
        ? adjustBoard(prevBoard, player)
        : prevBoard;

      const adjBoards = adjustBoard
        ? boardSet.map((g) => adjustBoard(g, player))
        : boardSet;

      const adjAction =
        adjustAction && lastAction
          ? adjustAction(lastAction, player)
          : lastAction;

      return {
        playerIndex: player,
        action: adjAction,
        prevBoard: adjPrevBoard,
        boardSet: adjBoards,
        final,
        ctx,
      };
    },

    submit: (inputAction, player) => {
      const action = { ...inputAction, player, time: Date.now() };
      const prevBoard = boardSet.at(-1)!;
      const res = getReducerUpdate(game.reducer, ctx, prevBoard, action);

      if (is.string(res)) return res;
      if (res.boardSet.length === 0)
        return "Action returned no error but caused no state change.";

      actions.push(action);
      boardSet = res.boardSet;
    },

    getHistory: () => ({
      startTime,
      ctx,
      actions,
    }),
  };
}

function validateContext<S extends Spec>(
  game: Game<S>,
  ctx: InputCtx<S>
): Ctx<S> | string {
  const [min, max] = game.meta.players;
  const validNumPlayers = ctx.numPlayers >= min && ctx.numPlayers <= max;
  if (!validNumPlayers) return "Invalid number of players";
  const options = game.getOptions(ctx.numPlayers, ctx.options);
  return {
    ...ctx,
    seed: ctx.seed ? ctx.seed : `auto_${Date.now()}`,
    options,
  };
}

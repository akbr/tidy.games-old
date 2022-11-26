import { is } from "@lib/compare";
import type { Spec } from "./spec";
import type { Game, PlayerAction, Ctx } from "./game";

export type StoreUpdate<S extends Spec> = {
  ctx: Ctx<S>;
  prevBoard: S["board"];
  action?: PlayerAction<S>;
  boards: S["board"][];
  final: boolean;
};

export type History<S extends Spec> = {
  ctx: Ctx<S>;
  actions: PlayerAction<S>[];
};

export type HistoryResults<S extends Spec> = {
  boardSets: S["board"][][];
  final: boolean;
};

export type FullHistory<S extends Spec> = History<S> & HistoryResults<S>;

export type GameStore<S extends Spec> = {
  get: (player?: number) => StoreUpdate<S>;
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

  const initialUpdate = game.reducer(initialBoard, ctx);

  if (is.string(initialUpdate))
    return `Error on initialUpdate: ${initialUpdate}`;

  const boardSets = [[initialBoard, ...initialUpdate.boards]];
  let final = initialUpdate.final;
  const actionQueue = [...actions];
  while (actionQueue.length > 0) {
    const action = actionQueue.shift()!;
    const prevBoard = boardSets.at(-1)!.at(-1)!;
    const res = game.reducer(prevBoard, ctx, action);
    if (is.string(res)) return res;
    if (res.final && actionQueue.length > 0) return `Premtature final`;
    final = res.final;
    boardSets.push(res.boards);
  }

  return {
    boardSets,
    final,
  };
}

export function createGameStore<S extends Spec>(
  game: Game<S>,
  initCtx: InputCtx<S>,
  initActions?: PlayerAction<S>[]
): GameStore<S> | string {
  const ctx = validateContext(game, initCtx);
  if (is.string(ctx)) return ctx;

  let actions: PlayerAction<S>[] = initActions ? [...initActions] : [];

  let initialHistory = getHistoryResults(game, {
    ctx,
    actions,
  });

  if (is.string(initialHistory)) return initialHistory;

  let final = initialHistory.final;
  let boards = initialHistory.boardSets.at(-1)!;

  //@ts-ignore
  initialHistory = null; // Garbage collection

  return {
    get: (player = -1) => {
      const { adjustBoard, adjustAction } = game;
      const prevBoard = boards.at(-1)!;
      const lastAction = actions.at(-1);

      const adjPrevBoard = adjustBoard
        ? adjustBoard(prevBoard, player)
        : prevBoard;

      const adjBoards = adjustBoard
        ? boards.map((g) => adjustBoard(g, player))
        : boards;

      const adjAction =
        adjustAction && lastAction
          ? adjustAction(lastAction, player)
          : lastAction;

      return {
        playerIndex: player,
        action: adjAction,
        prevBoard: adjPrevBoard,
        boards: adjBoards,
        final,
        ctx,
      };
    },

    submit: (inputAction, player) => {
      const action = { ...inputAction, player };
      const prevBoard = boards.at(-1)!;
      const res = game.reducer(prevBoard, ctx, action);

      if (is.string(res)) return res;
      if (res.boards.length === 0)
        return "Action returned no error but caused no state change.";

      actions.push(action);
      boards = res.boards;
    },

    getHistory: () => ({
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

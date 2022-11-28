import { is } from "@lib/compare";
import type { Spec } from "./spec";
import type { Game, PlayerAction, Ctx } from "./game";
import { applyPatches } from "./utils";

export type StoreUpdate<S extends Spec> = {
  idx: number;
  ctx: Ctx<S>;
  prevBoard: S["board"];
  action?: PlayerAction<S>;
  patches: Partial<S["board"]>[];
  final: boolean;
};

export type History<S extends Spec> = {
  ctx: Ctx<S>;
  actions: PlayerAction<S>[];
};

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

export function createGameStore<S extends Spec>(
  game: Game<S>,
  initCtx: InputCtx<S>
): GameStore<S> | string {
  const ctx = validateContext(game, initCtx);
  if (is.string(ctx)) return ctx;

  const initialBoard = game.getInitialBoard(ctx);
  if (is.string(initialBoard)) return initialBoard;

  const initialUpdate = game.reducer(initialBoard, ctx);

  if (is.string(initialUpdate))
    return `Error on initialUpdate: ${initialUpdate}`;

  let idx = 0;
  let prevBoard = initialBoard;
  let { boards, patches, final } = initialUpdate;
  let actions: PlayerAction<S>[] = [];

  function applyMask<T extends Partial<S["board"]>>(patch: T, player?: number) {
    if (!game.maskPatch || player === undefined) return patch;
    const mask = game.maskPatch!(patch, player);
    return mask ? { ...patch, ...mask } : patch;
  }

  return {
    get: (player) => {
      return {
        idx,
        ctx,
        prevBoard: applyMask(prevBoard, player),
        patches: patches.map((patch) => applyMask(patch, player)),
        final,
        actions: actions.at(-1),
      };
    },

    submit: (inputAction, player) => {
      const action = { ...inputAction, player };
      const nextUpdate = game.reducer(boards.at(-1)!, ctx, action);

      if (is.string(nextUpdate)) return nextUpdate;
      if (nextUpdate.boards.length === 0)
        return "Action returned no error but caused no state change.";

      prevBoard = boards.at(-1)!;
      actions.push(action);
      boards = nextUpdate.boards;
      patches = nextUpdate.patches;
      idx += 1;
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

// ---

export type HistoryResults<S extends Spec> = {
  boardSets: S["board"][][];
  final: boolean;
};

export type FullHistory<S extends Spec> = History<S> & HistoryResults<S>;

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
    const boards = applyPatches(prevBoard, res.patches);
    boardSets.push(boards);
  }

  return {
    boardSets,
    final,
  };
}

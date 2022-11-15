import { is } from "@lib/compare";
import type { Spec } from "./spec";
import { AuthAction, Ctx, getReducerUpdate, ReducerUpdate } from "./reducer";
import { Game } from "./game";

export type GameUpdate<S extends Spec> = {
  playerIndex: number;
  prevBoard: S["board"];
  action?: AuthAction<S>;
  boards: S["board"][];
  final: boolean;
  ctx: Ctx<S>;
};

export type GameStore<S extends Spec> = {
  get: (player?: number) => GameUpdate<S>;
  submit: (action: S["actions"], player: number) => string | void;
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

  const initialGame = game.getInitialBoard(ctx);
  if (is.string(initialGame)) return initialGame;

  const initialUpdate = getReducerUpdate(game.reducer, ctx, initialGame);
  if (is.string(initialUpdate))
    return `Error on initialUpdate: ${initialUpdate}`;

  let actions: AuthAction<S>[] = [];
  let prevBoard = initialGame;
  let prevReducerReducerUpdate: ReducerUpdate<S> = initialUpdate;

  return {
    get: (player = -1) => {
      const { adjustBoard, adjustAction } = game;
      const { boards, final } = prevReducerReducerUpdate;
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
      const action = { ...inputAction, player, time: Date.now() };
      const prev = prevReducerReducerUpdate.boards.at(-1)!;
      const update = getReducerUpdate(game.reducer, ctx, prev, action);

      if (is.string(update)) return update;
      if (update.boards.length === 0)
        return "Action returned no error but caused no state change.";

      actions.push(action);
      prevBoard = prev;
      prevReducerReducerUpdate = update;
    },
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

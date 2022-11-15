import { is } from "@lib/compare";
import type { Spec } from "./spec";
import { AuthAction, Ctx, getChartUpdate, ChartUpdate } from "./chart";
import type { Cart } from "./cart";

export type CartUpdate<S extends Spec> = {
  playerIndex: number;
  prevGame: S["game"];
  action?: AuthAction<S>;
  games: S["game"][];
  final: boolean;
  ctx: Ctx<S>;
};

export type CartStore<S extends Spec> = {
  get: (player?: number) => CartUpdate<S>;
  submit: (action: S["actions"], player: number) => string | void;
};

type InputCtx<S extends Spec> = {
  numPlayers: number;
  options?: Ctx<S>["options"];
  seed?: Ctx<S>["seed"];
};

export function createCartStore<S extends Spec>(
  cart: Cart<S>,
  initCtx: InputCtx<S>
): CartStore<S> | string {
  const ctx = validateContext(cart, initCtx);
  if (is.string(ctx)) return ctx;

  const initialGame = cart.getInitialGame(ctx);
  if (is.string(initialGame)) return initialGame;

  const initialUpdate = getChartUpdate(cart.chart, ctx, initialGame);
  if (is.string(initialUpdate))
    return `Error on initialUpdate: ${initialUpdate}`;

  let actions: AuthAction<S>[] = [];
  let prevGame = initialGame;
  let prevChartUpdate: ChartUpdate<S> = initialUpdate;

  return {
    get: (player = -1) => {
      const { adjustGame, adjustAction } = cart;
      const { games, final } = prevChartUpdate;
      const lastAction = actions.at(-1);

      const adjPrevGame = adjustGame ? adjustGame(prevGame, player) : prevGame;

      const adjGames = adjustGame
        ? games.map((g) => adjustGame(g, player))
        : games;

      const adjAction =
        adjustAction && lastAction
          ? adjustAction(lastAction, player)
          : lastAction;

      return {
        playerIndex: player,
        action: adjAction,
        prevGame: adjPrevGame,
        games: adjGames,
        final,
        ctx,
      };
    },
    submit: (inputAction, player) => {
      const action = { ...inputAction, player, time: Date.now() };
      const prev = prevChartUpdate.games.at(-1)!;
      const update = getChartUpdate(cart.chart, ctx, prev, action);

      if (is.string(update)) return update;
      if (update.games.length === 0)
        return "Action returned no error but caused no state change.";

      actions.push(action);
      prevGame = prev;
      prevChartUpdate = update;
    },
  };
}

function validateContext<S extends Spec>(
  cart: Cart<S>,
  ctx: InputCtx<S>
): Ctx<S> | string {
  const [min, max] = cart.meta.players;
  const validNumPlayers = ctx.numPlayers >= min && ctx.numPlayers <= max;
  if (!validNumPlayers) return "Invalid number of players";
  const options = cart.getOptions(ctx.numPlayers, ctx.options);
  return {
    ...ctx,
    seed: ctx.seed ? ctx.seed : `auto_${Date.now()}`,
    options,
  };
}

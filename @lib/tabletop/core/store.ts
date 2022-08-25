import { is } from "@lib/compare/is";
import type { Spec } from "./spec";
import { AuthenticatedAction, Ctx, getChartUpdate, ChartUpdate } from "./chart";
import type { Cart } from "./cart";

export type CartUpdate<S extends Spec> = {
  prev: S["states"];
  action?: AuthenticatedAction<S["actions"]>;
  patches: ChartUpdate<S>["patches"];
  final: ChartUpdate<S>["final"];
  ctx: Ctx<S>;
  player: number;
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

  const initialState = cart.getInitialState(ctx);
  if (is.string(initialState)) return initialState;

  const initialUpdate = getChartUpdate(cart.chart, ctx, initialState);
  if (is.string(initialUpdate)) return initialUpdate;

  let currentChart: ChartUpdate<S> = initialUpdate;

  let currentUpdate: CartUpdate<S> = {
    prev: initialState,
    ctx,
    player: -1,
    ...currentChart,
  };

  return {
    get: (player) =>
      adaptUpdateForPlayer(
        cart,
        currentUpdate,
        is.undefined(player) ? -1 : player
      ),
    submit: (inputAction, player) => {
      const action = { ...inputAction, player, time: Date.now() };
      const prev = currentChart.states.at(-1) || currentUpdate.prev;
      const update = getChartUpdate(cart.chart, ctx, prev, action);

      if (is.string(update)) return update;
      if (update.states.length === 0)
        return "Action returned no error but caused no state change.";

      currentChart = update;
      currentUpdate = {
        prev,
        action,
        ctx,
        player: -1,
        ...currentChart,
      };
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
  const options = ctx.options || cart.getOptions(ctx.numPlayers);
  const validOptions = cart.getOptions(ctx.numPlayers, options) === options;
  if (!validOptions) return "Invalid options";
  return {
    ...ctx,
    seed: ctx.seed ? ctx.seed : `auto_${Date.now()}`,
    options: ctx.options ? ctx.options : cart.getOptions(ctx.numPlayers),
  };
}

function adaptUpdateForPlayer<S extends Spec>(
  cart: Cart<S>,
  update: CartUpdate<S>,
  player: number
): CartUpdate<S> {
  if (player === -1) return update;
  const { stripAction, stripState } = cart;
  const { action, patches } = update;

  return {
    ...update,
    action: action && stripAction ? stripAction(action, player) : action,
    patches: stripState ? patches.map((p) => stripState(p, player)) : patches,
    player,
  };
}

/**
export type History<S extends Spec> = {
  ctx: Ctx<S>;
  initialState: S["states"];
  actions: AuthenticatedAction<S>[];
};

 */

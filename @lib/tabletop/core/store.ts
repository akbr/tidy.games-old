import { is } from "@lib/compare/is";
import type { Spec } from "./spec";
import { AuthenticatedAction, Ctx, getChartUpdate, ChartUpdate } from "./chart";
import type { Cart } from "./cart";

export type CartUpdate<S extends Spec> = {
  prev: S["states"];
  action?: AuthenticatedAction<S>;
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
  if (is.string(initialUpdate))
    return `Error on initialUpdate: ${initialUpdate}`;

  let actions: AuthenticatedAction<S>[] = [];
  let prevState = initialState;
  let prevChartUpdate: ChartUpdate<S> = initialUpdate;

  return {
    get: (player = -1) => {
      const { adjustState, adjustAction } = cart;
      const { patches, final } = prevChartUpdate;
      const lastAction = actions.at(-1);

      const nextPrev = adjustState
        ? (() => {
            const patch = adjustState(prevState, player);
            return patch ? { ...prevState, ...patch } : prevState;
          })()
        : prevState;

      const nextPatches = adjustState
        ? prevChartUpdate.patches.map((patch) => {
            const result = adjustState(patch, player);
            return result ? { ...patch, ...result } : patch;
          })
        : patches;

      const nextAction =
        adjustAction && lastAction
          ? (() => {
              const result = adjustAction(lastAction, player);
              return result ? { ...lastAction, ...result } : lastAction;
            })()
          : lastAction;

      return {
        player,
        prev: nextPrev,
        action: nextAction,
        patches: nextPatches,
        final,
        ctx,
      };
    },
    submit: (inputAction, player) => {
      const action = { ...inputAction, player, time: Date.now() };
      const prev = prevChartUpdate.states.at(-1)!;
      const update = getChartUpdate(cart.chart, ctx, prev, action);

      if (is.string(update)) return update;
      if (update.states.length === 0)
        return "Action returned no error but caused no state change.";

      actions.push(action);
      prevState = prev;
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

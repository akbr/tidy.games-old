import type { Spec } from "./spec";
import type { Chart, ChartUpdate, Ctx } from "./chart";
import type { Cart } from "./cart";

import { getChartUpdate } from "./chart";
import { is } from "@lib/compare/is";

export type AuthenticatedAction<S extends Spec> = S["actions"] & {
  player: number;
  time?: number;
};

export type MachineUpdate<S extends Spec> = {
  player: number;
  ctx: Ctx<S>;
  prevState: S["states"];
  action: AuthenticatedAction<S> | null;
} & ChartUpdate<S>;

function getMachineUpdate<S extends Spec>(
  chart: Chart<S>,
  ctx: Ctx<S>,
  prevState: S["states"],
  action?: AuthenticatedAction<S>
): MachineUpdate<S> | string | null {
  const result = getChartUpdate(chart, ctx, prevState, action);
  if (is.string(result) || is.null(result)) return result;
  return {
    ...result,
    ctx,
    prevState,
    action: action || null,
    player: -1,
  };
}

function adaptUpdateForPlayer<S extends Spec>(
  cart: Cart<S>,
  update: MachineUpdate<S>,
  player: number
): MachineUpdate<S> {
  if (player === -1) return update;
  const { stripAction, stripGame } = cart;
  const { ctx, action, patches, states } = update;
  return {
    ...update,
    player,
    ctx: { ...ctx, seed: undefined },
    action: action && stripAction ? stripAction(action, player) : action,
    patches: stripGame
      ? patches.map((p) => [p[0], stripGame(p, player)])
      : patches,
    states: stripGame
      ? states.map((s) => [s[0], stripGame(s, player)])
      : states,
  };
}

export type History<S extends Spec> = {
  ctx: Ctx<S>;
  initialState: S["states"];
  actions: AuthenticatedAction<S>[];
};

export type Machine<S extends Spec> = {
  get: (player?: number) => MachineUpdate<S>;
  submit: (action: S["actions"], player: number) => string | void;
  //getHistory: () => History<S>;
};

export function createMachine<S extends Spec>(cart: Cart<S>, ctx: Ctx<S>) {
  if (!ctx.seed) ctx = { ...ctx, seed: `auto_${Date.now()}` };

  const initState = cart.getInitialState(ctx);
  if (is.string(initState)) return initState;

  const initUpdate = getMachineUpdate(cart.chart, ctx, initState);
  if (is.string(initUpdate)) return initUpdate;
  if (is.null(initUpdate)) return "Initial update was null.";

  let currentUpdate = initUpdate;

  const api: Machine<S> = {
    get: (player) => adaptUpdateForPlayer(cart, currentUpdate, player || -1),
    submit: (action, player) => {
      const authAction = { ...action, player, time: Date.now() };
      const latestState = currentUpdate.states.at(-1)!;
      const updateResult = getMachineUpdate(
        cart.chart,
        ctx,
        latestState,
        authAction
      );

      if (is.string(updateResult)) return updateResult;
      if (is.null(updateResult))
        return "Submission caused no state change and returned no error.";

      currentUpdate = updateResult;
    },
  };

  return api;
}

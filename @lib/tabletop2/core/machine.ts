import type { Spec } from "./spec";
import type { Chart, Ctx, StatePatch } from "./chart";
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
  state: S["states"];
  action: AuthenticatedAction<S> | null;
  patches: StatePatch<S>[];
  final: boolean;
};

export type History<S extends Spec> = {
  ctx: Ctx<S>;
  initialState: S["states"];
  actions: AuthenticatedAction<S>[];
};

export type Machine<S extends Spec> = {
  get: (player?: number) => MachineUpdate<S>;
  submit: (action: S["actions"], player: number) => string | void;
  getHistory: () => History<S>;
};

function getMachineUpdate<S extends Spec>(
  chart: Chart<S>,
  ctx: Ctx<S>,
  inputState: S["states"],
  action?: AuthenticatedAction<S>
): [MachineUpdate<S>, S["states"]] | string | null {
  const result = getChartUpdate(chart, ctx, inputState, action);
  if (is.string(result) || is.null(result)) return result;
  let { states, patches, final } = result;
  let state = states.shift()!; // take first new state
  patches.shift(); // remove first patch
  let lastState = states.length ? states.pop()! : state; // take most recent state
  return [
    {
      ctx,
      state,
      patches,
      final,
      player: -1,
      action: action || null,
    },
    lastState,
  ];
}

export function createMachine<S extends Spec>(cart: Cart<S>, ctx: Ctx<S>) {
  if (!ctx.seed) ctx = { ...ctx, seed: `auto_${Date.now()}` };

  const initState = cart.getInitialState(ctx);
  if (is.string(initState)) return initState;
  const initResult = getMachineUpdate(cart.chart, ctx, initState);
  if (is.string(initResult)) return initResult;
  if (is.null(initResult)) return "Initial update cannot be null.";
  const [initUpdate, initCurrentState] = initResult;

  let update = initUpdate;
  let state = initCurrentState;

  const api: Machine<S> = {
    get: (player) => {
      if (is.undefined(player)) return update;
    },
  };
}

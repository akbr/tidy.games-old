import type { Spec } from "./spec";
import type { Ctx } from "./chart";
import type { StateUpdate, Cart } from "./cart";

import { getStateUpdate } from "./cart";
import { is } from "@lib/compare/is";

export type AuthenticatedAction<S extends Spec> = S["actions"] & {
  player: number;
  time?: number;
};

export type HostUpdate<S extends Spec> = StateUpdate<S> & {
  ctx: Ctx<S>;
  action: AuthenticatedAction<S> | null;
};

function adaptUpdateForPlayer<S extends Spec>(
  cart: Cart<S>,
  update: HostUpdate<S>,
  player: number
): HostUpdate<S> {
  if (player === -1) return update;
  const { stripAction, stripGame } = cart;
  const { action, patches, states } = update;
  return {
    ...update,
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

export type Host<S extends Spec> = {
  get: (player?: number) => HostUpdate<S>;
  submit: (action: S["actions"], player: number) => string | void;
};

export function createHost<S extends Spec>(
  cart: Cart<S>,
  initCtx: {
    numPlayers: number;
    options?: Ctx<S>["options"];
    seed?: Ctx<S>["seed"];
  }
) {
  const [min, max] = cart.meta.players;
  const validNumPlayers =
    initCtx.numPlayers >= min && initCtx.numPlayers <= max;
  if (!validNumPlayers) return "Invalid number of players";

  const options = initCtx.options || cart.getOptions(initCtx.numPlayers);
  const validOptions = cart.getOptions(initCtx.numPlayers, options) === options;
  if (!validOptions) return "Invalid options provided";

  const ctx = {
    ...initCtx,
    seed: initCtx.seed ? initCtx.seed : `auto_${Date.now()}`,
    options: initCtx.options
      ? initCtx.options
      : cart.getOptions(initCtx.numPlayers),
  };

  let initUpdate = getStateUpdate(cart, ctx);
  if (is.string(initUpdate)) return initUpdate;
  if (is.null(initUpdate)) return "Initial update was null.";

  let currentUpdate: HostUpdate<S> = {
    ...initUpdate,
    ctx,
    action: null,
  };

  const api: Host<S> = {
    get: (player) => adaptUpdateForPlayer(cart, currentUpdate, player || -1),
    submit: (action, player) => {
      const authAction = { ...action, player, time: Date.now() };
      const latestState = currentUpdate.states.at(-1)!;
      const updateResult = getStateUpdate(cart, ctx, latestState, authAction);

      if (is.string(updateResult)) return updateResult;
      if (is.null(updateResult))
        return "Submission caused no state change and returned no error.";

      currentUpdate = {
        ...updateResult,
        ctx,
        action: authAction,
      };
    },
  };

  return api;
}

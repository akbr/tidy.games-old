import type { Spec } from "./spec";
import type { Cart, Ctx, AuthenticatedAction } from "./cart";

import { is } from "@lib/compare/is";
import { lastOf } from "@lib/array";

export type Machine<S extends Spec> = {
  get: (player?: number) => Step<S>;
  submit: (action: S["actions"], player: number) => string | void;
  export: () => {
    ctx: Ctx<S>;
    initial: S["gameStates"];
    actions: AuthenticatedAction<S>[];
  };
};

export type Patch<S extends Spec> = [S["states"], Partial<S["game"]>];

export type Step<S extends Spec> = {
  prev: S["gameStates"];
  action: AuthenticatedAction<S> | null;
  patches: Patch<S>[];
  final: boolean;
  ctx: Ctx<S>;
  player: number;
};

export type MachineOptions<S extends Spec> = {
  ctx: Ctx<S>;
  initial?: S["gameStates"];
  actions?: AuthenticatedAction<S>[];
};

export const createMachine = <S extends Spec>(
  cart: Cart<S>,
  machineOptions: MachineOptions<S>
): Machine<S> | string => {
  const { stripAction = (x) => x, stripGameState = (x) => x } = cart;

  const inputSeed = machineOptions.ctx.seed;
  const ctx = {
    ...machineOptions.ctx,
    seed: machineOptions.ctx.seed || String(Date.now()),
  };

  const initialState = machineOptions.initial || cart.setup(ctx);

  if (is.string(initialState)) return initialState;

  let step: Step<S>;

  const actions = machineOptions.actions || [];
  const initialStep = getNextStep(cart, initialState, ctx, null);

  if (is.string(initialStep)) return initialStep;
  if (is.null(initialStep)) return "Initial step returned null.";
  step = initialStep;

  return {
    get: (player = -1) => {
      const { prev, patches, action } = step;
      const isGod = player === -1;
      const shouldRevealSeed = isGod || !!inputSeed;

      return {
        ...step,
        player,
        ctx: { ...ctx, seed: shouldRevealSeed ? ctx.seed : undefined },
        prev: isGod ? prev : stripGameState(prev, player),
        patches: isGod
          ? patches
          : patches.map((patch) => stripGameState(patch, player)),
        action: action ? (isGod ? stripAction(action, player) : action) : null,
      };
    },
    submit: (action, player) => {
      const authedAction = {
        ...action,
        player,
        time: Date.now(),
      };
      const res = getNextStep(cart, lastOf(getStates(step)), ctx, authedAction);
      if (is.string(res)) return res;
      if (res === null)
        return "State did not advance, but no error message was provided.";

      actions.push(authedAction);
      step = res;
    },
    export: () => ({
      ctx,
      initial: initialState,
      actions,
    }),
  };
};

export const getNextStep = <S extends Spec>(
  cart: Cart<S>,
  initial: S["gameStates"],
  ctx: Ctx<S>,
  action: AuthenticatedAction<S> | null
): Step<S> | null | string => {
  const res = getNextStates(cart, initial, ctx, action);

  if (is.string(res) || is.null(res)) return res;

  return {
    prev: initial,
    patches: res.patches,
    final: res.final,
    ctx,
    action,
    player: -1,
  };
};

export const getNextStates = <S extends Spec>(
  cart: Cart<S>,
  initial: S["gameStates"],
  ctx: Ctx<S>,
  action: AuthenticatedAction<S> | null
) => {
  const gameStates: S["gameStates"][] = [];
  const patches: Patch<S>[] = [];

  let iterarting = true;
  let currentAction = action || null;
  let final = false;

  while (iterarting) {
    const prev = lastOf(gameStates) || initial;
    const [state, prevGame] = prev as Patch<S>;

    const patch = cart.chart[state](
      prevGame as S["gameGlossary"][S["states"]],
      ctx,
      currentAction
    ) as Patch<S> | true | null;

    currentAction = null;

    if (is.string(patch)) return patch;

    if (patch === true) {
      final = true;
      iterarting = false;
      continue;
    }

    if (patch !== null) {
      patches.push(patch);
      gameStates.push(applyPatch(prev, patch));
      continue;
    }

    iterarting = false;
  }

  return !!patches.length
    ? {
        patches,
        final,
      }
    : null;
};

export const applyPatch = <S extends Spec>(
  [, game]: S["gameStates"],
  [nextState, patch]: Patch<S>
): S["gameStates"] => [nextState, { ...game, ...patch }];

export const getStates = <S extends Spec>({
  prev,
  patches,
  action,
}: Step<S>) => {
  const states: S["gameStates"][] = [];
  const isInitialStep = !action;
  if (isInitialStep) states.push(prev);
  patches.forEach((patch) => {
    const nextState = applyPatch(lastOf(states) || prev, patch);
    states.push(nextState);
  });
  return states;
};

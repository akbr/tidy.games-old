import type { Spec } from "./spec";
import type { Cart, Ctx, AuthenticatedAction, GameStatePatch } from "./cart";

import { is } from "@lib/compare/is";
import { lastOf } from "@lib/array";

export type Machine<S extends Spec> = {
  get: (player?: number) => Segment<S>;
  submit: (action: S["actions"], player: number) => string | void;
  export: () => {
    ctx: Ctx<S>;
    initial: S["gameStates"];
    actions: AuthenticatedAction<S>[];
  };
};

export type Segment<S extends Spec> = {
  prev: S["gameStates"];
  action: AuthenticatedAction<S> | null;
  patches: GameStatePatch<S>[];
  final: boolean;
  ctx: Ctx<S>;
  player: number;
};

export type Frame<S extends Spec> = {
  state: S["gameStates"];
  action: AuthenticatedAction<S> | null;
  ctx: Ctx<S>;
  player: number;
};

export const createMachine = <S extends Spec>(
  cart: Cart<S>,
  inputCtx: Ctx<S>,
  inputState?: S["gameStates"],
  inputActions?: AuthenticatedAction<S>[]
): Machine<S> | string => {
  const { stripAction = (x) => x } = cart;

  const inputSeed = inputCtx.seed;
  const ctx = {
    ...inputCtx,
    seed: inputCtx.seed || String(Date.now()),
  };

  const initialState = inputState || cart.setup(ctx);

  if (is.string(initialState)) return initialState;

  let segment: Segment<S>;

  const actions = inputActions || [];
  const initialSegment = getNextSegment(cart, initialState, ctx, null);

  if (is.string(initialSegment)) return initialSegment;
  if (is.null(initialSegment)) return "Initial step returned null.";
  segment = initialSegment;

  return {
    get: (player = -1) => {
      const { prev, patches, action } = segment;
      const isGod = player === -1;
      const shouldRevealSeed = isGod || !!inputSeed;

      return {
        ...segment,
        player,
        ctx: { ...ctx, seed: shouldRevealSeed ? ctx.seed : undefined },
        prev: isGod
          ? prev
          : cart.stripGame
          ? [prev[0], cart.stripGame(prev, player)]
          : prev,
        patches: isGod
          ? patches
          : patches.map((patch) =>
              cart.stripGame ? [patch[0], cart.stripGame(patch, player)] : patch
            ),
        action: action ? (isGod ? stripAction(action, player) : action) : null,
      };
    },
    submit: (action, player) => {
      const authedAction = {
        ...action,
        player,
        time: Date.now(),
      };
      const res = getNextSegment(
        cart,
        lastOf(getStates(segment)),
        ctx,
        authedAction
      );
      if (is.string(res)) return res;
      if (res === null)
        return "State did not advance, but no error message was provided.";

      actions.push(authedAction);
      segment = res;
    },
    export: () => ({
      ctx,
      initial: initialState,
      actions,
    }),
  };
};

export const getNextSegment = <S extends Spec>(
  cart: Cart<S>,
  initialState: S["gameStates"],
  ctx: Ctx<S>,
  action: AuthenticatedAction<S> | null
): Segment<S> | null | string => {
  const res = getNextStates(cart, initialState, ctx, action);

  if (is.null(res)) return res;
  if (is.string(res)) return res;

  return {
    prev: initialState,
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
  const patches: GameStatePatch<S>[] = [];

  let iterarting = true;
  let final = false;

  while (iterarting) {
    const prev = lastOf(gameStates) || initial;
    const [state, prevGame] = prev as GameStatePatch<S>;

    const patch = cart.chart[state](
      prevGame as S["gameGlossary"][S["states"]],
      ctx,
      gameStates.length ? null : action
    ) as GameStatePatch<S> | true | null | string;

    if (is.string(patch)) return patch;

    if (patch === true) {
      final = true;
      iterarting = false;
      continue;
    }

    if (patch === null) {
      iterarting = false;
      continue;
    }

    patches.push(patch);
    gameStates.push(applyPatch(prev, patch));
  }

  if (patches.length === 0) return null;

  return {
    patches,
    final,
  };
};

export const applyPatch = <S extends Spec>(
  [, game]: S["gameStates"],
  [nextState, patch]: GameStatePatch<S>
): S["gameStates"] => [nextState, { ...game, ...patch }];

export const getStates = <S extends Spec>({
  prev,
  patches,
  action,
}: Segment<S>) => {
  const states: S["gameStates"][] = [];
  const isInitialStep = !action;
  if (isInitialStep) states.push(prev);
  patches.forEach((patch) => {
    const nextState = applyPatch(lastOf(states) || prev, patch);
    states.push(nextState);
  });
  return states;
};

export const getFrames = <S extends Spec>(segment: Segment<S>): Frame<S>[] => {
  const { action, ctx, player } = segment;
  return getStates(segment).map((state, idx) => ({
    state,
    action: idx === 0 ? action : null,
    ctx,
    player,
  }));
};

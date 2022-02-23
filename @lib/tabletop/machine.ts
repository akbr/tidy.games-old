import type {
  Spec,
  GameDefinition,
  Ctx,
  AuthenticatedAction,
  ChartReturns,
  Chart,
} from "./types";

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

export type MachineOptions<S extends Spec> = {
  ctx: Ctx<S>;
  initial?: S["gameStates"];
  actions?: AuthenticatedAction<S>[];
};

export type Step<S extends Spec> = {
  prev: S["gameStates"];
  action: AuthenticatedAction<S> | null;
  patches: S["patches"][];
  final: boolean;
  ctx: Ctx<S>;
  player: number;
};

export const applyPatch = <S extends Spec>(
  [, game]: S["gameStates"],
  [nextState, patch]: S["patches"]
): S["gameStates"] => [nextState, { ...game, ...patch }];

export const getStates = <S extends Spec>({ prev, patches }: Step<S>) => {
  const states: S["gameStates"][] = [];
  patches.forEach((patch) => {
    const nextState = applyPatch(lastOf(states) || prev, patch);
    states.push(nextState);
  });
  return states;
};

export const getNextStates = <S extends Spec>(
  chart: Chart<S>,
  initial: S["gameStates"],
  ctx: Ctx<S>,
  action: AuthenticatedAction<S> | null
) => {
  const gs: S["gameStates"][] = [];
  const patches: S["patches"][] = [];
  let iterarting = true;
  let currentAction = action || null;
  let final = false;

  while (iterarting) {
    const prev = lastOf(gs) || initial;
    const [state, prevGame] = prev as [
      keyof GameDefinition<S>["chart"],
      S["gameTypes"][keyof S["gameTypes"]]
    ];

    const patch = chart[state](prevGame, ctx, currentAction) as ChartReturns<S>;

    currentAction = null;

    if (is.string(patch)) return patch;

    if (patch === true) {
      final = true;
      iterarting = false;
      continue;
    }

    if (patch !== null) {
      patches.push(patch);
      gs.push(applyPatch(prev, patch));
      continue;
    }

    iterarting = false;
  }

  return patches.length === 0
    ? null
    : {
        patches,
        final,
      };
};

export const getNextStep = <S extends Spec>(
  chart: Chart<S>,
  initial: S["gameStates"],
  ctx: Ctx<S>,
  action: AuthenticatedAction<S> | null
): Step<S> | null | string => {
  const res = getNextStates(chart, initial, ctx, action);
  if (is.string(res)) return res;
  if (res === null) return res;
  return {
    prev: initial,
    patches: res.patches,
    final: res.final,
    ctx,
    action,
    player: -1,
  };
};

export const createMachine = <S extends Spec>(
  definition: GameDefinition<S>,
  options: MachineOptions<S>
): Machine<S> | string => {
  const {
    setup,
    chart,
    stripAction = (x) => x,
    stripGame = (x) => x,
  } = definition;
  const iCtx = options.ctx || {};
  const ctx = {
    ...iCtx,
    seed: iCtx.seed || String(Date.now()),
  };

  const initialState = options.initial || setup(ctx);
  if (is.string(initialState)) return initialState;

  let step: Step<S>;

  const actions = options.actions || [];
  const initialStep = getNextStep(chart, initialState, ctx, null);
  if (is.string(initialStep)) return initialStep;
  if (is.null(initialStep)) return "Initial step returned null.";
  step = initialStep;

  return {
    get: (player = -1) => {
      const { prev, patches, action } = step;
      const isGod = player === -1;
      return {
        ...step,
        player,
        ctx: { ...ctx, seed: isGod ? ctx.seed : null },
        prev: isGod ? prev : stripGame(prev, player),
        patches: isGod
          ? patches
          : patches.map((patch) => stripGame(patch, player)),
        action: action ? (isGod ? stripAction(action, player) : action) : null,
      };
    },
    submit: (action, player) => {
      const authedAction = {
        ...action,
        player,
        time: Date.now(),
      };
      const res = getNextStep(
        chart,
        lastOf(getStates(step)),
        ctx,
        authedAction
      );
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

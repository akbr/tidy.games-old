import type {
  Spec,
  GameDefinition,
  Ctx,
  AuthenticatedAction,
  ChartReturns,
  Chart,
} from "./types";

import { lastOf } from "@lib/array";

const is = {
  string: (x: unknown): x is string => typeof x === "string",
  number: (x: unknown): x is number => typeof x === "number",
};

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

export type Status<S extends Spec> = {
  prev: S["gameStates"];
  patches: S["patches"][];
  curr: S["gameStates"];
  final: boolean;
};

export type Step<S extends Spec> = Omit<Status<S>, "curr"> & {
  action: AuthenticatedAction<S> | null;
  ctx: Ctx<S>;
  player: number;
  step: number;
};

export const applyPatch = <S extends Spec>(
  [, game]: S["gameStates"],
  [nextState, patch]: S["patches"]
): S["gameStates"] => [nextState, { ...game, ...patch }];

export const applyPatches = <S extends Spec>(
  initial: S["gameStates"],
  patches: S["patches"][]
) => {
  const gs: S["gameStates"][] = [];
  patches.forEach((patch) => {
    const next = applyPatch(lastOf(gs) || initial, patch);
    gs.push(next);
  });
  return gs;
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

  return {
    curr: lastOf(gs),
    patches,
    final,
  };
};

export const getNextStatus = <S extends Spec>(
  chart: Chart<S>,
  initial: S["gameStates"],
  ctx: Ctx<S>,
  action: AuthenticatedAction<S> | null
): Status<S> | string => {
  const res = getNextStates(chart, initial, ctx, action);
  if (is.string(res)) return res;
  return {
    prev: initial,
    patches: res.patches,
    curr: res.curr,
    final: res.final,
  };
};

export const getStatuses = <S extends Spec>(
  chart: Chart<S>,
  initial: S["gameStates"],
  ctx: Ctx<S>,
  actions: AuthenticatedAction<S>[]
) => {
  const statuses: Status<S>[] = [];
  const initialStatus = getNextStatus(chart, initial, ctx, null);
  if (is.string(initialStatus)) return initialStatus;
  statuses.push(initialStatus);

  const actionQueue = [...actions];
  while (actionQueue.length > 0) {
    const action = actionQueue.shift();
    const nextStatus = getNextStatus(
      chart,
      lastOf(statuses).curr,
      ctx,
      action!
    );
    if (is.string(nextStatus)) return nextStatus;
    statuses.push(nextStatus);
  }

  return statuses;
};

export const createStep = <S extends Spec>(
  { stripGame = (s) => s, stripAction = (a) => a }: GameDefinition<S>,
  status: Status<S>,
  {
    step,
    player,
    action,
    ctx,
  }: {
    step: number;
    player: number;
    action: AuthenticatedAction<S> | null;
    ctx: Ctx<S>;
  }
) => {
  const isGod = player === -1;
  return {
    player,
    step,
    ctx: { ...ctx, seed: isGod ? ctx.seed : null },
    prev: isGod ? status.prev : stripGame(status.prev, player),
    patches: isGod
      ? status.patches
      : status.patches.map((patch) => stripGame(patch, player)),
    action: action ? (isGod ? stripAction(action, player) : action) : null,
    final: status.final,
  };
};

export const createMachine = <S extends Spec>(
  definition: GameDefinition<S>,
  { ctx: inputCtx, initial, actions: inputActions }: MachineOptions<S>
): Machine<S> | string => {
  const { setup, chart } = definition;
  const ctx = {
    ...(inputCtx || {}),
    seed: inputCtx.seed || String(Date.now()),
  };

  const initialState = initial || setup(ctx);
  if (is.string(initialState)) return initialState;

  let step = 0;
  let initialStatus: Status<S>;
  const actions = inputActions || [];
  if (actions.length === 0) {
    const status = getNextStatus(chart, initialState, ctx, null);
    if (is.string(status)) return status;
    initialStatus = status;
  } else {
    const statuses = getStatuses(chart, initialState, ctx, actions);
    if (is.string(statuses)) return statuses;
    initialStatus = lastOf(statuses);
    step += statuses.length - 1;
  }

  let status = initialStatus;
  return {
    get: (player = -1) =>
      createStep(definition, status, {
        player,
        step,
        ctx,
        action: lastOf(actions),
      }),
    submit: (action, player) => {
      const authedAction = {
        ...action,
        player,
        time: Date.now(),
      };
      const res = getNextStatus(chart, status.curr, ctx, authedAction);
      if (is.string(res)) return res;
      if (res.curr === res.prev)
        return "State did not advance, but no error message was provided.";
      actions.push(authedAction);
      step += 1;
      status = res;
    },
    export: () => ({
      ctx,
      initial: initialState,
      actions,
    }),
  };
};

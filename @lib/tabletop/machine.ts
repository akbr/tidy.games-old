import type { Spec, GameDefinition, Ctx, AuthenticatedAction } from "./types";

import { lastOf } from "@lib/array";

export const isErr = (arg: unknown): arg is string => typeof arg === "string";

export const getNextStep = <S extends Spec>(
  chart: GameDefinition<S>["chart"],
  gameState: S["gameStates"],
  ctx: Ctx<S>,
  action: AuthenticatedAction<S> | null
) => {
  const games: S["gameStates"][] = [];
  const patches: S["gamePatch"][] = [];

  let iterarting = true;
  let currentAction = action || null;
  let final = false;

  while (iterarting) {
    const [state, prevGame] = (lastOf(games) || gameState) as [
      keyof GameDefinition<S>["chart"],
      S["gameTypes"][keyof S["gameTypes"]]
    ];

    const patch = chart[state](prevGame, ctx, currentAction) as
      | S["gamePatch"]
      | string
      | true
      | null;

    currentAction = null;

    if (isErr(patch)) return patch;

    if (patch === true) {
      final = true;
      iterarting = false;
      continue;
    }

    if (patch !== null) {
      patches.push(patch);
      games.push([
        patch[0],
        {
          ...prevGame,
          ...patch[1],
        },
      ]);
      continue;
    }

    iterarting = false;
  }

  return {
    prevGame: gameState,
    currGame: lastOf(games),
    action,
    patches,
    final,
  };
};

export type Status<S extends Spec> = {
  player: number;
  step: number;
  ctx: Ctx<S>;
  prevGame: S["gameStates"];
  patches: S["gamePatch"][];
  action: AuthenticatedAction<S> | null;
  final: boolean;
};

export type Machine<S extends Spec> = {
  get: (player?: number) => Status<S>;
  submit: (action: S["actions"], player: number) => string | void;
  export: () => {
    ctx: Ctx<S>;
    initialState: S["gameStates"];
    actions: AuthenticatedAction<S>[];
  };
};

export const createMachine = <S extends Spec>(
  {
    setup,
    chart,
    stripGame = (s) => s,
    stripAction = (a) => a,
  }: GameDefinition<S>,
  inputCtx: Ctx<S>,
  history?: {
    initialState: S["gameStates"];
    actions: AuthenticatedAction<S>[];
  }
): Machine<S> | string => {
  const ctx = {
    ...inputCtx,
    seed: inputCtx.seed || String(Date.now()),
  };

  const initialState = history ? history.initialState : setup(ctx);
  if (isErr(initialState)) return initialState;

  const initialStatus = getNextStep(chart, initialState, ctx, null);
  if (isErr(initialStatus)) return initialStatus;

  let step = 0;
  let status = initialStatus;
  const actions = history ? history.actions : [];
  return {
    get: (player = -1) => {
      const { prevGame, patches, action, final } = status;
      return {
        player,
        step,
        ctx: { ...ctx, seed: player === -1 ? ctx.seed : null },
        prevGame: stripGame(prevGame, player),
        patches: patches.map((patch) => stripGame(patch, player)),
        action: action ? stripAction(action, player) : action,
        final,
      };
    },
    submit: (action, player) => {
      const authedAction = {
        ...action,
        player,
        time: Date.now(),
      };
      const res = getNextStep(chart, status.currGame, ctx, authedAction);
      if (isErr(res)) return res;
      if (res.patches.length === 0)
        return "State did not advance, but no error message was provided.";
      actions.push(authedAction);
      status = res;
      step += 1;
    },
    export: () => ({
      ctx,
      initialState,
      actions,
    }),
  };
};

import { is } from "@lib/compare/is";
import type { Spec } from "./spec";

export type Ctx<S extends Spec> = {
  numPlayers: number;
  options: S["options"];
  seed: string;
};

export type AuthenticatedAction<S extends Spec> = Spec["actions"] & {
  player: number;
};

export type NonStateReturns = true | string;

export type AutoStateEntry<S extends Spec> = (
  state: S["states"],
  ctx: Ctx<S>
) => Partial<S["states"]> | Partial<S["states"]>[] | NonStateReturns;

export type ActionValidator<S extends Spec> = (
  action: AuthenticatedAction<S>,
  state: S["states"],
  ctx: Ctx<S>
) => AuthenticatedAction<S> | string;

export type ActionStateEntry<S extends Spec> = (
  state: S["states"],
  ctx: Ctx<S>,
  action: AuthenticatedAction<S>
) => Partial<S["states"]> | Partial<S["states"]>[] | NonStateReturns;

export type ActionEntry<S extends Spec> = [
  ActionValidator<S>,
  ActionStateEntry<S>
];

export function withAction<
  S extends Spec,
  A extends AuthenticatedAction<S> | string
>(
  actionFn: (
    action: AuthenticatedAction<S>,
    state: S["states"],
    ctx: Ctx<S>
  ) => A,
  entryFn: (
    state: S["states"],
    ctx: Ctx<S>,
    action: Exclude<A, string>
  ) => Partial<S["states"]> | Partial<S["states"]>[] | NonStateReturns
) {
  return [actionFn, entryFn] as unknown as ActionEntry<S>;
}

export type Chart<S extends Spec> = Partial<{
  [Phase in S["phases"]]: AutoStateEntry<S> | ActionEntry<S>;
}>;

export type ChartUpdate<S extends Spec> = {
  patches: Partial<S["states"]>[];
  states: S["states"][];
  final: boolean;
};

export function getChartUpdate<S extends Spec>(
  chart: Chart<S>,
  ctx: Ctx<S>,
  inputState: S["states"],
  action?: AuthenticatedAction<S>
): ChartUpdate<S> | string {
  const patches: Partial<S["states"]>[] = [];
  const states: S["states"][] = [];

  let final = false;
  let iterarting = true;

  while (iterarting) {
    const priorState = states.at(-1) || inputState;
    const phase = priorState.phase as S["phases"];

    const chartFn = chart[phase];

    if (!chartFn) {
      return `No entry point for phase "${phase}".`;
    }

    let result: Partial<S["states"]> | Partial<S["states"]>[] | NonStateReturns;

    if (typeof chartFn === "function") {
      if (action) return `Phase ${phase} does not accept actions.`;
      result = chartFn(priorState, ctx);
    } else {
      if (!action) {
        iterarting = false;
        continue;
      }

      const [actionFn, stateFn] = chartFn;
      const modAction = actionFn(action, priorState, ctx);
      if (is.string(modAction)) return modAction;
      result = stateFn(priorState, ctx, modAction);
    }

    action = undefined;

    if (is.string(result)) return result;

    if (result === true) {
      iterarting = false;
      final = true;
      continue;
    }

    const patch = result;
    const patchez = Array.isArray(patch) ? patch : [patch];
    patchez.forEach((patch) => {
      let prev = states.at(-1) || inputState;
      patches.push(patch);
      states.push({ ...prev, ...patch });
    });
  }

  return {
    patches,
    states,
    final,
  };
}

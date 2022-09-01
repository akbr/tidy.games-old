import { is } from "@lib/compare/is";
import type { Spec, NonStateReturns } from "./spec";

export type Ctx<S extends Spec> = {
  numPlayers: number;
  options: S["options"];
  seed: string;
};

export type AuthenticatedAction<A extends {}> = A & {
  player: number;
  time?: number;
};

export type Chart<S extends Spec> = {
  [Phase in S["phases"]]: (
    state: S["states"],
    ctx: Ctx<S>,
    action?: AuthenticatedAction<S["actions"]>
  ) => Partial<S["states"]> | Partial<S["states"]>[] | NonStateReturns;
};

export type StatePatch<S extends Spec> = { phase: S["phases"] } & Partial<
  S["game"]
>;

export type ChartUpdate<S extends Spec> = {
  patches: Partial<S["states"]>[];
  states: S["states"][];
  final: boolean;
};

export function getChartUpdate<S extends Spec>(
  chart: Chart<S>,
  ctx: Ctx<S>,
  inputState: S["states"],
  action?: AuthenticatedAction<S["actions"]>
): ChartUpdate<S> | string {
  const patches: Partial<S["states"]>[] = [];
  const states: S["states"][] = [];

  let final = false;
  let iterarting = true;

  while (iterarting) {
    const priorState = states.at(-1) || inputState;

    //@ts-ignore
    const chartFn = chart[priorState.phase];

    const result = chartFn(priorState, ctx, action) as
      | Partial<S["states"]>
      | Partial<S["states"]>[]
      | NonStateReturns;

    // Only run action on first iteration
    action = undefined;

    if (is.string(result)) {
      return result;
    }
    if (is.null(result)) {
      iterarting = false;
      continue;
    }
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

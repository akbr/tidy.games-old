import { is } from "@lib/compare/is";
import type { Spec, NonStateReturns } from "./spec";

export type Ctx<S extends Spec> = {
  numPlayers: number;
  options: S["options"];
  seed?: string;
};

export type Chart<S extends Spec> = {
  [Phase in S["phases"]]: (
    game: S["stateGlossary"][Phase],
    ctx: Ctx<S>,
    action?: S["actions"]
  ) => S["patchGlossary"][Phase];
};

// ---

export type StatePatch<S extends Spec> = [S["phases"], Partial<S["game"]>];
export type ChartReturn<S extends Spec> = StatePatch<S> | NonStateReturns;
export const applyPatch = <S extends Spec>(
  [, game]: S["states"],
  [nextState, patch]: StatePatch<S>
): S["states"] => [nextState, { ...game, ...patch }];

export type ChartUpdate<S extends Spec> = {
  patches: StatePatch<S>[];
  states: S["states"][];
  final: boolean;
};

export function getChartUpdate<S extends Spec>(
  chart: Chart<S>,
  ctx: Ctx<S>,
  inputState: S["states"],
  action?: S["actions"]
): ChartUpdate<S> | string | null {
  const patches: StatePatch<S>[] = [];
  const states: S["states"][] = [];

  let final = false;
  let iterarting = true;
  while (iterarting) {
    const prevState = inputState || states.at(-1)!;

    const [phase, prevGameState] = prevState as [any, any];
    const result = chart[phase](prevGameState, ctx, action) as ChartReturn<S>;

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
    patches.push(patch);
    states.push(applyPatch(prevState, patch));
  }

  if (states.length === 0) return null;

  return {
    patches,
    states,
    final,
  };
}

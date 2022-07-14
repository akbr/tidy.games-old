import type { Spec } from "./spec";
import type { Ctx, Chart, StatePatch } from "./chart";

import { getChartUpdate } from "./chart";
import { is } from "@lib/compare/is";

export type Cart<S extends Spec> = {
  meta: {
    name: string;
    players: [number, number];
  };
  getOptions: (numPlayers: number, options?: S["options"]) => S["options"];
  getInitialState: (ctx: Ctx<S>) => S["states"] | string;
  chart: Chart<S>;
  stripGame?: <State extends S["states"]>(
    gameState: [State[0], Partial<State[1]>],
    player: number
  ) => Partial<State[1]>;
  stripAction?: <A extends S["actions"]>(action: A, player: number) => A | null;
  botFn?: BotFn<S>;
};

export type BotFn<S extends Spec> = (
  state: S["states"],
  ctx: Ctx<S>,
  playerIndex: number
) => S["actions"] | void;

export type StateUpdate<S extends Spec> = {
  patches: StatePatch<S>[];
  states: S["states"][];
  final: boolean;
};

export function getStateUpdate<S extends Spec>(
  cart: Cart<S>,
  ctx: Ctx<S>,
  prevState?: S["states"],
  action?: S["actions"]
): StateUpdate<S> | string | null {
  const state = prevState || cart.getInitialState(ctx);
  if (is.string(state)) return state;

  const result = getChartUpdate(cart.chart, ctx, state, action);
  if (is.string(result)) return result;

  if (!prevState) {
    const initPatch = [state[0], {}] as StatePatch<S>;
    if (is.null(result)) {
      return {
        states: [state],
        patches: [initPatch],
        final: false,
      };
    }
    result.states.unshift(state);
    result.patches.unshift(initPatch);
  }

  return result;
}

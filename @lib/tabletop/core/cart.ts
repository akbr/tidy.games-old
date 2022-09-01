import type { Spec } from "./spec";
import type { Ctx, Chart, StatePatch, AuthenticatedAction } from "./chart";

export type Cart<S extends Spec> = {
  meta: {
    name: string;
    players: [number, number];
  };
  getOptions: (numPlayers: number, options?: S["options"]) => S["options"];
  getInitialState: (ctx: Ctx<S>) => S["states"] | string;
  chart: Chart<S>;
  actionKeys: ActionKeys<S["actions"]>;
  adjustState?: (
    state: S["states"],
    player: number,
    patch: StatePatch<S>
  ) => Partial<S["game"]> | void;
  adjustAction?: (
    action: AuthenticatedAction<S["actions"]>,
    player: number
  ) => Partial<AuthenticatedAction<S>> | false | undefined;
  botFn?: BotFn<S>;
};

export type ActionKeys<Actions extends { type: string }> = {
  [Action in Actions as Action["type"]]: any;
};

export type BotFn<S extends Spec> = (
  state: S["states"],
  ctx: Ctx<S>,
  playerIndex: number
) => S["actions"] | void;

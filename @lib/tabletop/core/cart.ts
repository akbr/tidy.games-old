import type { Spec } from "./spec";
import type { Ctx, Chart, StatePatch } from "./chart";

export type Cart<S extends Spec> = {
  meta: {
    name: string;
    players: [number, number];
  };
  getOptions: (numPlayers: number, options?: S["options"]) => S["options"];
  getInitialState: (ctx: Ctx<S>) => S["states"] | string;
  chart: Chart<S>;
  actionKeys: ActionKeys<S["actions"]>;
  stripState?: <State extends StatePatch<S>>(
    gameState: State,
    player: number
  ) => StatePatch<S>;
  stripAction?: <A extends S["actions"]>(
    action: A,
    player: number
  ) => A | undefined;
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

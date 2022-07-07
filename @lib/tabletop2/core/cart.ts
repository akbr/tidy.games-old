import type { Spec } from "./spec";
import type { Ctx, Chart } from "./chart";

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

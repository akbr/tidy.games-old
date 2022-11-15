import type { Spec } from "./spec";
import type { Ctx, Chart, AuthAction } from "./chart";

export type Cart<S extends Spec> = {
  meta: {
    name: string;
    players: [number, number];
  };
  getNumPlayers: (numPlayers?: number) => number;
  getOptions: (numPlayers: number, options?: S["options"]) => S["options"];
  getInitialGame: (ctx: Ctx<S>) => S["game"];
  chart: Chart<S>;
  actionKeys: ActionKeys<S["actions"]>;
  adjustGame?: (game: S["game"], player: number) => S["game"];
  adjustAction?: (action: AuthAction<S>, player: number) => AuthAction<S>;
  botFn?: BotFn<S>;
};

export type ActionKeys<Actions extends { type: string }> = {
  [Action in Actions as Action["type"]]: any;
};

export type BotFn<S extends Spec> = (
  game: S["game"],
  ctx: Ctx<S>,
  playerIndex: number
) => S["actions"] | void;

// ---

export function getCtx<S extends Spec>(cart: Cart<S>, seed = ""): Ctx<S> {
  const numPlayers = cart.getNumPlayers();
  const options = cart.getOptions(numPlayers);
  return { numPlayers, options, seed };
}

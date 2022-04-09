import type { Spec } from "./spec";

export type Cart<S extends Spec> = {
  // metadata
  meta: {
    name: string;
    players: [number, number];
  };
  actionStubs: ActionStubs<S["actions"]>;
  // "server side" stuff
  setOptions: (numPlayers: number, options?: S["options"]) => S["options"];
  setup: (ctx: Ctx<S>) => S["gameStates"] | string;
  chart: Chart<S>;
  stripGame?: <GS extends S["gameStates"]>(
    gameState: [GS[0], Partial<GS[1]>],
    player: number
  ) => Partial<GS[1]>;
  stripAction?: (
    action: AuthenticatedAction<S>,
    player: number
  ) => AuthenticatedAction<S> | null;
  botFn?: BotFn<S>;
};

export type Ctx<S extends Spec> = {
  numPlayers: number;
  options: S["options"];
  seed?: string;
};

export type BotFn<S extends Spec> = (
  frame: { state: S["gameStates"]; ctx: Ctx<S>; player: number },
  send: (action: S["actions"]) => void
) => void;

export type GameStatePatch<S extends Spec> = [S["states"], Partial<S["game"]>];
export type Chart<S extends Spec> = {
  [State in S["states"]]: (
    game: S["gameGlossary"][State],
    ctx: Ctx<S>,
    action: AuthenticatedAction<S> | null
  ) => S["gameStateReturns"][State] | string;
};

export type AuthenticatedAction<S extends Spec> = S["actions"] & {
  player: number;
  time?: number;
};

export type ActionStubs<Actions extends Spec["actions"]> = {
  [Action in Actions as Action["type"]]: null;
};

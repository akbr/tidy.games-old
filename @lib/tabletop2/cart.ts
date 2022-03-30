import type { Spec } from "./spec";

export type Cart<S extends Spec> = {
  // metadaa
  meta: {
    name: string;
    players: [number, number];
  };
  actionStubs: ActionStubs<S["actions"]>;
  // "server side" stuff
  setOptions: (numPlayers: number, options?: S["options"]) => S["options"];
  setup: (ctx: Ctx<S>) => S["gameStates"] | string;
  chart: Chart<S>;
  stripGameState?: (
    gameState: S["gameStates"],
    player: number
  ) => S["gameStates"];
  stripAction?: (
    action: AuthenticatedAction<S>,
    player: number
  ) => AuthenticatedAction<S> | null;
  botFn?: (state: S["gameStates"], player: number) => S["actions"] | void;
};

export type Ctx<S extends Spec> = {
  numPlayers: number;
  options: S["options"];
  seed?: string;
};

export type Chart<S extends Spec> = {
  [State in S["states"]]: (
    game: S["gameGlossary"][State],
    ctx: Ctx<S>,
    action: AuthenticatedAction<S> | null
  ) => S["gameStateReturns"][State];
};

export type AuthenticatedAction<S extends Spec> = S["actions"] & {
  player: number;
  time?: number;
};

export type ActionStubs<Actions extends Spec["actions"]> = {
  [Action in Actions as Action["type"]]: null;
};

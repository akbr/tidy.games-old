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
  setup: (ctx: Ctx<S>) => S["states"] | string;
  chart: Chart<S>;
  stripGame?: <GS extends S["states"]>(
    gameState: [GS[0], Partial<GS[1]>],
    player: number
  ) => Partial<GS[1]>;
  stripAction?: (
    action: AuthenticatedAction<S>,
    player: number
  ) => AuthenticatedAction<S> | null;
  botFn?: BotFn<S>;
  createAnalysis?: (stream: Stream<S>, ctx: Ctx<S>) => S["analysis"];
};

export type Ctx<S extends Spec> = {
  numPlayers: number;
  options: S["options"];
  seed?: string;
};

export type BotFn<S extends Spec> = (
  frame: { state: S["states"]; ctx: Ctx<S>; player: number },
  send: (action: S["actions"]) => void
) => void;

export type StatePatch<S extends Spec> = [S["phases"], Partial<S["game"]>];

export type Chart<S extends Spec> = {
  [Phase in S["phases"]]: (
    game: S["stateGlossary"][Phase],
    ctx: Ctx<S>,
    action: AuthenticatedAction<S> | null
  ) => S["patchGlossary"][Phase] | string;
};

export type AuthenticatedAction<S extends Spec> = S["actions"] & {
  player: number;
  time?: number;
};

export type ActionStubs<Actions extends Spec["actions"]> = {
  [Action in Actions as Action["type"]]: null;
};

export type Stream<S extends Spec> = (S["states"] | AuthenticatedAction<S>)[];

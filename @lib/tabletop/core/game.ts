import type { Spec } from "./spec";

export type Game<S extends Spec> = {
  meta: {
    name: string;
    players: [number, number];
  };
  getOptions: (numPlayers: number, options?: S["options"]) => S["options"];
  getInitialBoard: (ctx: Ctx<S>) => S["board"];
  reducer: Reducer<S>;
  actionKeys: ActionKeys<S["actions"]>;
  maskPatch?: (
    board: Partial<S["board"]>,
    player: number
  ) => Partial<S["board"]> | void;
  adjustAction?: (action: PlayerAction<S>, player: number) => PlayerAction<S>;
  botFn?: BotFn<S>;
};

export type Reducer<S extends Spec> = (
  lastBoard: S["board"],
  ctx: Ctx<S>,
  action?: PlayerAction<S>
) =>
  | {
      boards: S["board"][];
      patches: Partial<S["board"]>[];
      final: boolean;
    }
  | string;

export type Ctx<S extends Spec> = {
  numPlayers: number;
  options: S["options"];
  seed: string;
};

export type PlayerAction<S extends Spec> = S["actions"] & {
  player: number;
};

export type ActionKeys<Actions extends { type: string }> = {
  [Action in Actions as Action["type"]]: any;
};

export type BotFn<S extends Spec> = (
  board: S["board"],
  ctx: Ctx<S>,
  playerIndex: number
) => S["actions"] | void;

// ---

export function getCtx<S extends Spec>(game: Game<S>, seed = ""): Ctx<S> {
  const numPlayers = game.meta.players[0];
  const options = game.getOptions(numPlayers);
  return { numPlayers, options, seed };
}

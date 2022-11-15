import type { Spec } from "./spec";
import type { Reducer, Ctx, AuthAction } from "./reducer";

export type Game<S extends Spec> = {
  meta: {
    name: string;
    players: [number, number];
  };
  getOptions: (numPlayers: number, options?: S["options"]) => S["options"];
  getInitialBoard: (ctx: Ctx<S>) => S["board"];
  reducer: Reducer<S>;
  actionKeys: ActionKeys<S["actions"]>;
  adjustBoard?: (board: S["board"], player: number) => S["board"];
  adjustAction?: (action: AuthAction<S>, player: number) => AuthAction<S>;
  botFn?: BotFn<S>;
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

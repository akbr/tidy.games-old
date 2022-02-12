import type { AuthenticatedAction, Ctx, Spec } from "./types";
import type { Status } from "./machine";
import type { PlayerFn } from "./game";
import { lastOf } from "@lib/array";

export type Frame<S extends Spec> = {
  player: number;
  step: number;
  ctx: Ctx<S>;
  gameState: S["gameStates"];
  action: AuthenticatedAction<S> | null;
  final: boolean;
};

export const getGames = <S extends Spec>(status: Status<S>) => {
  const games: S["gameStates"][] = [];
  status.patches.forEach(([state, next]) => {
    const [, prev] = lastOf(games) || status.prevGame;
    games.push([state, { ...prev, ...next }]);
  });
  return games;
};

export const getCurrentGame = <S extends Spec>(status: Status<S>) =>
  lastOf(getGames(status));

export const getFrames = <S extends Spec>(
  status: Status<S>,
  includePrev?: boolean
) => {
  const frames: Frame<S>[] = [];
  const { prevGame, patches, action, ...meta } = status;

  if (includePrev || action)
    frames.push({ gameState: prevGame, action, ...meta });
  getGames(status).forEach((gameState) => {
    frames.push({ gameState, action: null, ...meta });
  });
  return frames;
};

const wrapStateBot =
  <S extends Spec>(
    botFn: (game: S["gameStates"], player: number) => S["actions"] | void,
    submit: (player: number, action: S["actions"]) => void
  ): PlayerFn<S> =>
  (status) => {
    if (typeof status === "string") return;
    const [state, game] = getCurrentGame(status);
    const action = botFn([state, game], status.player);
    if (action) submit(status.player, action);
  };

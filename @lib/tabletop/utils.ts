import type { AuthenticatedAction, Ctx, Spec } from "./types";
import type { Step } from "./machine";
import type { PlayerFn } from "./game";
import { lastOf } from "@lib/array";

export type Frame<S extends Spec> = {
  player: number;
  step: number;
  idx: number;
  ctx: Ctx<S>;
  gameState: S["gameStates"];
  action: AuthenticatedAction<S> | null;
  final: boolean;
};

export const getGames = <S extends Spec>(step: Step<S>) => {
  const games: S["gameStates"][] = [];
  step.patches.forEach(([state, next]) => {
    const [, prev] = lastOf(games) || step.prev;
    games.push([state, { ...prev, ...next }]);
  });
  return games;
};

export const getCurrentGame = <S extends Spec>(step: Step<S>) =>
  lastOf(getGames(step));

export const getFrames = <S extends Spec>(step: Step<S>) => {
  const frames: Frame<S>[] = [];
  const { prev, patches, action, ...rest } = step;
  frames.push({ gameState: prev, action, idx: frames.length, ...rest });
  getGames(step).forEach((gameState) => {
    frames.push({ gameState, action: null, idx: frames.length, ...rest });
  });
  return frames;
};

type ActionStubs<S extends Spec> = {
  [X in S["actions"] as X["type"]]: (str: string) => X["data"];
};
type ConnectedAction<S extends Spec> = {
  [X in S["actions"] as X["type"]]: (player: number, str: string) => void;
};
export const createActionFns = <S extends Spec>(
  stubs: ActionStubs<S>,
  submit: (player: number, action: S["actions"]) => void
) => {
  const fns = {} as ConnectedAction<S>;
  for (let i in stubs) {
    const key = i as keyof ConnectedAction<S>;
    const fn = stubs[key];
    fns[key] = (player, str) => {
      submit(player, { type: key, data: fn(str) });
    };
  }
  return fns;
};

export const wrapStateBot =
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

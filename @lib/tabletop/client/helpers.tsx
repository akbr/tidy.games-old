import { Spec, Ctx, Actions, AuthenticatedAction, ActionStubs } from "../types";
import { Step, getStates } from "../machine";

export type Frame<S extends Spec> = {
  state: S["gameStates"];
  action: S["actions"] | null;
  ctx: Ctx<S>;
  player: number;
};

export const getFrames = <S extends Spec>(step: Step<S>): Frame<S>[] => {
  const { prev, action, ctx, player } = step;

  const createFrame = (
    state: S["gameStates"],
    action: AuthenticatedAction<S> | null
  ) => ({
    state,
    action,
    ctx,
    player,
  });

  const nextStates = getStates(step);

  const firstFrame =
    action === null
      ? // This is the first state of the game; include it.
        createFrame(prev, action)
      : // This is a state triggered by an action; include an "overlap."
        createFrame(nextStates[0], action);
  const restFrames = nextStates.map((state) => createFrame(state, null));

  return [firstFrame, ...restFrames];
};

export type ConnectedActions<A extends Actions> = {
  [X in A as X["type"]]: (input: X["data"]) => void;
};

export const createActions = <A extends Actions>(
  stubs: ActionStubs<A>,
  submit: (action: A) => void
) => {
  const fns = {} as ConnectedActions<A>;
  for (let k in stubs) {
    const key = k as keyof ConnectedActions<A>;
    const fn = stubs[key];
    fns[key] = (input) => submit({ type: key, data: input } as A);
  }
  return fns;
};

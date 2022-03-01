import type {
  Spec,
  Frame,
  Actions,
  AuthenticatedAction,
  ActionStubs,
  ConnectedActions,
  GameDefinition,
  BotFn,
} from "./types";
import { Step, getStates } from "./machine";
import { ClientSocket } from "./server";
import { lastOf } from "@lib/array";

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

export const createBotSocket = <S extends Spec>(
  socket: ClientSocket<S>,
  def: GameDefinition<S>,
  botFn: BotFn<S>
) => {
  const actions = createActions(def.actionStubs, (a) => {
    socket.send(["machine", a]);
  });
  socket.onmessage = ([type, payload]) => {
    if (type !== "machine") return;
    const lastFrame = lastOf(getFrames(payload));
    botFn(lastFrame, actions);
  };
};

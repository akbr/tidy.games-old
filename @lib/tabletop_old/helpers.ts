import type {
  Spec,
  Frame,
  Actions,
  ActionStubs,
  ConnectedActions,
  GameDefinition,
  BotFn,
} from "./types";

import { Step, getStates } from "./machine";
import { ClientSocket } from "./server";
import { lastOf } from "@lib/array";

export const getFrames = <S extends Spec>(step: Step<S>): Frame<S>[] => {
  const { action, ctx, player } = step;
  return getStates(step).map((state, idx) => ({
    state,
    action: idx === 0 ? action : null,
    ctx,
    player,
  }));
};

export const createActions = <A extends Actions>(
  stubs: ActionStubs<A>,
  submit: (action: A) => void
) => {
  const fns = {} as ConnectedActions<A>;
  for (let k in stubs) {
    const key = k as keyof ConnectedActions<A>;
    fns[key] = (input: any) => submit({ type: key, data: input } as A);
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

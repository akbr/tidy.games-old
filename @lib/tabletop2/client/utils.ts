import type { Spec } from "../spec";
import type { Cart, ActionStubs } from "../cart";
import { getStates, Step } from "../machine";
import {
  actionStubs,
  ServerActions,
  ServerInputs,
  ServerOutputs,
} from "../server";

import { Socket } from "@lib/socket";
import { deep } from "@lib/compare/deep";
import { ConnectedActions, Frame } from "./client";

export function createControls<S extends Spec>(
  socket: Socket<ServerInputs<S>, ServerOutputs<S>>,
  def: Cart<S>
) {
  return {
    game: createActions<S["actions"]>(def.actionStubs, (action) => {
      socket.send(["machine", action]);
    }),
    server: createActions<ServerActions<S>>(actionStubs, (action) => {
      socket.send(["server", action]);
    }),
  };
}

export const getFrames = <S extends Spec>(step: Step<S>): Frame<S>[] => {
  const { action, ctx, player } = step;
  return getStates(step).map((state, idx) => ({
    state,
    action: idx === 0 ? action : null,
    ctx,
    player,
  }));
};

export const createActions = <A extends Spec["actions"]>(
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

export function patch<T extends Object>(prev: Record<string, any>, next: T): T {
  const merged = {} as T;
  for (const k in prev) {
    const key = k as keyof T;
    if (deep(prev[k], next[key])) {
      merged[key] = prev[k];
    } else {
      merged[key] = next[key];
    }
  }
  return merged;
}

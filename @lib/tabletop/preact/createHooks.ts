import { createUseEmitter, UseEmitterHook } from "@lib/emitter";
import { Client, ClientState } from "../client";
import { Spec } from "../core";

export function useClientTitle<S extends Spec>(client: Client<S>) {
  return createUseEmitter(client.emitter) as UseEmitterHook<
    Extract<ClientState<S>, { mode: "title" }>
  >;
}

export function useClientLobby<S extends Spec>(client: Client<S>) {
  return createUseEmitter(client.emitter) as UseEmitterHook<
    Extract<ClientState<S>, { mode: "lobby" }>
  >;
}

export function useClientGame<S extends Spec>(client: Client<S>) {
  return createUseEmitter(client.emitter) as UseEmitterHook<
    Extract<ClientState<S>, { mode: "game" }>
  >;
}

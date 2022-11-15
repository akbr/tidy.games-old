import type { FunctionalComponent } from "preact";
import type { Emitter } from "@lib/emitter";
import type { Spec } from "../core";
import type { AppState, Client } from "../client";

export type AppProps<S extends Spec> = {
  client: Client<S>;
  dialogEmitter: DialogEmittet<S>;
  setDialog: SetDialog<S>;
};

export type DialogView<S extends Spec> = FunctionalComponent<AppProps<S>>;
export type DialogEmittet<S extends Spec> = Emitter<DialogView<S> | null>;
export type SetDialog<S extends Spec> = (val: DialogView<S> | null) => void;

export type AppViews<S extends Spec> = {
  Backdrop?: FunctionalComponent<AppProps<S>>;
  AppContainer?: FunctionalComponent<AppProps<S>>;
  Title?: FunctionalComponent<AppProps<S>>;
  Lobby?: FunctionalComponent<AppProps<S>>;
  Game?: FunctionalComponent<AppProps<S>>;
  Side?: FunctionalComponent<AppProps<S>>;
};

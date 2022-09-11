import { Spec } from "@lib/tabletop/core/spec";
import {
  ClientProps,
  TitleFrame,
  LobbyFrame,
  GameFrame,
} from "@lib/tabletop/client/";
import { FunctionalComponent } from "preact";

export type DialogView<S extends Spec> = FunctionalComponent<Props<S>>;

export type SetDialog<S extends Spec> = (View: DialogView<S> | null) => void;

export type TitleProps<S extends Spec> = {
  frame: TitleFrame<S>;
} & ClientProps<S> & { setDialog: SetDialog<S> };

export type LobbyProps<S extends Spec> = {
  frame: LobbyFrame<S>;
} & ClientProps<S> & { setDialog: SetDialog<S> };

export type GameProps<S extends Spec> = {
  frame: GameFrame<S>;
} & ClientProps<S> & { setDialog: SetDialog<S> };

export type Props<S extends Spec> =
  | TitleProps<S>
  | LobbyProps<S>
  | GameProps<S>;

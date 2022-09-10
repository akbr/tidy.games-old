import { Spec } from "@lib/tabletop/core/spec";
import {
  ClientProps,
  TitleFrame,
  LobbyFrame,
  GameFrame,
} from "@lib/tabletop/client/";

export type TitleProps<S extends Spec> = {
  frame: TitleFrame<S>;
} & ClientProps<S>;

export type LobbyProps<S extends Spec> = {
  frame: LobbyFrame<S>;
} & ClientProps<S>;

export type GameProps<S extends Spec> = {
  frame: GameFrame<S>;
} & ClientProps<S>;

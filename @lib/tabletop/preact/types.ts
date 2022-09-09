import { Spec } from "@lib/tabletop/core/spec";
import { Frame, ClientProps } from "@lib/tabletop/client/";

export type TitleFrame<S extends Spec> = Frame<S> & {
  room: null;
  state: null;
  ctx: null;
};

export type LobbyFrame<S extends Spec> = Frame<S> & {
  room: NonNullable<Frame<S>["room"]>;
  state: null;
  ctx: null;
};

export type GameFrame<S extends Spec> = Frame<S> & {
  room: NonNullable<Frame<S>["room"]>;
  state: NonNullable<Frame<S>["state"]>;
  ctx: NonNullable<Frame<S>["ctx"]>;
};

export type TitleProps<S extends Spec> = {
  frame: TitleFrame<S>;
} & ClientProps<S>;

export type LobbyProps<S extends Spec> = {
  frame: LobbyFrame<S>;
} & ClientProps<S>;

export type GameProps<S extends Spec> = {
  frame: GameFrame<S>;
} & ClientProps<S>;

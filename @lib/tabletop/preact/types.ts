import { Spec } from "@lib/tabletop/core/spec";
import { ClientUpdate, ClientProps } from "@lib/tabletop/client/";

export type TitleFrame<S extends Spec> = ClientUpdate<S> & {
  room: null;
  state: null;
  ctx: null;
};

export type LobbyFrame<S extends Spec> = ClientUpdate<S> & {
  room: NonNullable<ClientUpdate<S>["room"]>;
  state: null;
  ctx: null;
};

export type GameFrame<S extends Spec> = ClientUpdate<S> & {
  room: NonNullable<ClientUpdate<S>["room"]>;
  state: NonNullable<ClientUpdate<S>["state"]>;
  ctx: NonNullable<ClientUpdate<S>["ctx"]>;
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

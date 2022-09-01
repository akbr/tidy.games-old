import { Spec } from "@lib/tabletop/core/spec";
import { Client, ClientUpdate } from "@lib/tabletop/client/";

export type TitleProps<S extends Spec> = {
  meta: Client<S>["cart"]["meta"];
  connected: ClientUpdate<S>["connected"];
  actions: {
    join: Client<S>["actions"]["server"]["join"];
  };
};

export type LobbyProps<S extends Spec> = {
  cart: Client<S>["cart"];
  room: NonNullable<ClientUpdate<S>["room"]>;
  actions: {
    start: Client<S>["actions"]["server"]["start"];
    leave: Client<S>["actions"]["server"]["leave"];
    setMeta: Client<S>["actions"]["server"]["setMeta"];
    addBot?: Client<S>["actions"]["server"]["addBot"];
  };
};

export type GameProps<S extends Spec> = {
  meta: Client<S>["cart"]["meta"];
  ctx: NonNullable<ClientUpdate<S>["ctx"]>;
  room: NonNullable<ClientUpdate<S>["room"]>;
  state: S["states"];
  action: ClientUpdate<S>["action"];
  actions: Client<S>["actions"];
};

import { createSubscription, Subscription } from "@lib/store";
import { Meter, createMeter } from "@lib/meter";
import { createSocketManager } from "@lib/socket";

import { Spec } from "../core/spec";
import { AuthenticatedAction, Ctx } from "../core/chart";
import { Cart } from "../core/cart";
import { expandStates } from "../core/utils";

import { ServerActions, actionKeys, ServerApi } from "../server/createServer";
import { RoomData } from "../server/routines";
import { is } from "@lib/compare/is";
import { CartUpdate } from "../core/store";

export type ClientUpdate<S extends Spec> = {
  connected: boolean;
  room: RoomData | null;
  state: S["states"] | null;
  ctx: Ctx<S> | null;
  action: AuthenticatedAction<S["actions"]> | null;
  err: { type: "serverErr" | "cartErr"; msg: string } | null;
};

export type Client<S extends Spec> = {
  subscribe: Subscription<ClientUpdate<S>>["subscribe"];
  get: Subscription<ClientUpdate<S>>["get"];
  actions: {
    server: ActionFns<ServerActions<S>>;
    cart: ActionFns<S["actions"]>;
  };
  meter: Meter<ClientUpdate<S>["state"]>;
  cart: Cart<S>;
};

export function createClient<S extends Spec>(
  server: ServerApi<S> | string,
  cart: Cart<S>
): Client<S> {
  let status: ClientUpdate<S> = {
    connected: false,
    room: null,
    state: null,
    ctx: null,
    action: null,
    err: null,
  };
  function set(update: Partial<ClientUpdate<S>>) {
    status = { ...status, ...update };
  }

  const store = createSubscription(status);
  const meter = createMeter<ClientUpdate<S>["state"]>(null);

  function update() {
    store.next(status);
  }

  let lastUpdate: CartUpdate<S> | null = null;
  const socket = createSocketManager(server, {
    onopen: () => {
      set({ connected: true });
      update();
    },
    onclose: () => {
      set({ connected: false });
      update();
    },
    onmessage: ({ room, cartUpdate, cartErr, serverErr }) => {
      if (is.defined(room)) {
        if (room === null) {
          lastUpdate = null;
          set({ room, state: null, ctx: null, action: null });
        } else {
          set({ room });
        }
      }
      if (cartErr) set({ err: { type: "cartErr", msg: cartErr } });
      if (serverErr) set({ err: { type: "serverErr", msg: serverErr } });

      if (cartUpdate) {
        const { ctx, prev, patches, action, final } = cartUpdate;
        const states: S["states"][] = [];

        if (!status.ctx) set({ ctx });
        if (action) set({ action });
        if (!lastUpdate) states.push(prev);
        if (patches.length > 0) states.push(...expandStates(cartUpdate));

        if (states.length > 0) {
          meter.actions.pushStates(...states);
        } else {
          update();
        }

        lastUpdate = cartUpdate;
        return;
      }

      update();
    },
  });

  meter.subscribe(({ state }) => {
    set({ state });
    update();
  });

  const actions = {
    server: createActionFns(actionKeys, "server", socket),
    cart: createActionFns(cart.actionKeys, "cart", socket),
  } as Client<S>["actions"];

  socket.open();

  return {
    subscribe: store.subscribe,
    get: store.get,
    actions,
    meter,
    cart,
  };
}

type ActionFns<A extends { type: string; data?: any }> = {
  [T in A as T["type"]]: undefined extends T["data"]
    ? (data?: T["data"]) => void
    : (data: T["data"]) => void;
};

function createActionFns(
  actionKeys: Record<string, any>,
  to: "server" | "cart",
  socket: { send: Function }
) {
  const actions: Record<string, any> = {};
  Object.keys(actionKeys).forEach((type) => {
    actions[type] = (data: any) => {
      socket.send({ to, msg: { type, data } });
    };
  });
  return actions;
}

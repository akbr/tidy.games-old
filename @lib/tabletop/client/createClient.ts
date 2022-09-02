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

type MeterState<S extends Spec> = {
  state: ClientUpdate<S>["state"];
  action: ClientUpdate<S>["action"];
};

export type Client<S extends Spec> = {
  subscribe: Subscription<ClientUpdate<S>>["subscribe"];
  get: Subscription<ClientUpdate<S>>["get"];
  actions: {
    server: ActionFns<ServerActions<S>>;
    cart: ActionFns<S["actions"]>;
  };
  meter: Meter<MeterState<S>>;
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

  const meter = createMeter<MeterState<S>>({ state: null, action: null });

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
      const mod: Partial<ClientUpdate<S>> = {};
      let meterActions: Function[] = [];

      if (is.defined(room)) {
        mod.room = room;

        if (room === null) {
          lastUpdate = null;
          mod.ctx = null;
          meterActions.push(meter.actions.reset);
        }
      }

      if (cartErr) {
        mod.err = { type: "cartErr", msg: cartErr };
      }
      if (serverErr) {
        mod.err = { type: "serverErr", msg: serverErr };
      }

      if (cartUpdate) {
        const { ctx, prev, patches, action, final } = cartUpdate;
        const meterStates: MeterState<S>[] = [];

        if (!status.ctx) {
          mod.ctx = ctx;
        }

        if (!lastUpdate) meterStates.push({ state: prev, action: null });

        if (patches.length > 0) {
          const meterUpdates = expandStates(cartUpdate).map((state, idx) => {
            if (idx === 0 && action) return { state, action };
            return { state, action: null };
          });
          meterStates.push(...meterUpdates);
        }

        if (meterStates.length > 0) {
          meterActions.push(() => meter.actions.pushStates(...meterStates));
        }

        lastUpdate = cartUpdate;
      }

      status = {
        ...status,
        ...mod,
      };

      if (meterActions.length > 0) {
        meterActions.forEach((fn) => fn());
      } else {
        update();
      }
    },
  });

  meter.subscribe(({ state }) => {
    set({ ...state });
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

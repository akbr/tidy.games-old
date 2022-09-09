import { createSubscription, Subscription } from "@lib/store";
import { Meter, createMeter } from "@lib/meter";
import { createSocketManager } from "@lib/socket";

import { Spec } from "../core/spec";
import { AuthenticatedAction, Ctx, getChartUpdate } from "../core/chart";
import { Cart } from "../core/cart";
import { expandStates } from "../core/utils";

import { ServerActions, actionKeys, ServerApi } from "../server/createServer";
import { RoomData } from "../server/routines";
import { is } from "@lib/compare/is";
import { CartUpdate } from "../core/store";

export type Frame<S extends Spec> = {
  connected: boolean;
  room: RoomData | null;
  state: S["states"] | null;
  ctx: Ctx<S> | null;
  action: AuthenticatedAction<S> | null;
  err: { type: "serverErr" | "cartErr"; msg: string } | null;
};

type MeterState<S extends Spec> = {
  state: Frame<S>["state"];
  action: Frame<S>["action"];
};

export type ClientProps<S extends Spec> = {
  actions: {
    server: ActionFns<ServerActions<S>>;
    cart: ActionFns<S["actions"]>;
  };
  meter: Meter<MeterState<S>>;
  cart: Cart<S>;
};

type ClientSubscriptionMethods<S extends Spec> = {
  subscribe: Subscription<Frame<S>>["subscribe"];
  get: Subscription<Frame<S>>["get"];
};

export type Client<S extends Spec> = ClientSubscriptionMethods<S> &
  ClientProps<S>;

export function createClient<S extends Spec>(
  server: ServerApi<S> | string,
  cart: Cart<S>
): Client<S> {
  let status: Frame<S> = {
    connected: false,
    room: null,
    state: null,
    ctx: null,
    action: null,
    err: null,
  };
  let statusRef = { current: status };
  function set(update: Partial<Frame<S>>) {
    status = { ...status, ...update };
    statusRef.current = status;
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
      const mod: Partial<Frame<S>> = {};
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

      set(mod);

      if (meterActions.length > 0) {
        meterActions.forEach((fn) => fn());
      } else {
        update();
      }
    },
  });

  meter.subscribe(({ state }) => {
    set(state);
    update();
  });

  const actions = {
    server: createServerActionFns(actionKeys, socket),
    cart: createCartActionFns(cart, socket, statusRef, (msg) => {
      set({ err: { type: "cartErr", msg: `Client submission error: ${msg}` } });
      update();
    }),
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
    ? (data?: T["data"]) => boolean
    : (data: T["data"]) => boolean;
};

function createCartActionFns<S extends Spec>(
  cart: Cart<S>,
  socket: { send: Function },
  statusRef: { current: Frame<S> },
  onErr: (err: string) => void
) {
  const actions: Record<string, any> = {};
  Object.keys(cart.actionKeys).forEach((type) => {
    actions[type] = (data: any) => {
      const { ctx, state, room } = statusRef.current;
      if (!ctx || !state || !room) {
        onErr("Client cannot submit action: no ctx or state");
        return false;
      }
      const action = {
        type,
        data,
        player: room.player,
      };
      const chartUpdate = getChartUpdate(cart.chart, ctx, state, action);
      if (is.string(chartUpdate)) {
        onErr(chartUpdate);
        return false;
      }
      socket.send({ to: "cart", msg: action });
      return true;
    };
  });
  return actions;
}

function createServerActionFns(
  actionKeys: Record<string, any>,
  socket: { send: Function }
) {
  const actions: Record<string, any> = {};
  Object.keys(actionKeys).forEach((type) => {
    actions[type] = (data: any) => {
      socket.send({ to: "server", msg: { type, data } });
      return true;
    };
  });
  return actions;
}

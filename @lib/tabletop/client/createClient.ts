import { is } from "@lib/compare/is";
import { createSubscribable, Subscribable } from "@lib/subscribable";
import { Meter, createMeter } from "@lib/meter";
import { createSocketManager } from "@lib/socket";

import { Spec } from "../core/spec";
import { AuthenticatedAction, Ctx, getChartUpdate } from "../core/chart";
import { Cart } from "../core/cart";
import { expandStates } from "../core/utils";

import { ServerActions, actionKeys, ServerApi } from "../server/createServer";
import { RoomData } from "../server/routines";
import { CartUpdate } from "../core/store";

export type Frame<S extends Spec> = {
  connected: boolean;
  room: RoomData | null;
  state: S["states"] | null;
  ctx: Ctx<S> | null;
  action: AuthenticatedAction<S> | null;
  err: { type: "serverErr" | "cartErr"; msg: string } | null;
};

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

export type MeterState<S extends Spec> = {
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

type ClientOutput<S extends Spec> =
  | { view: "title"; frame: TitleFrame<S> }
  | { view: "lobby"; frame: LobbyFrame<S> }
  | { view: "game"; frame: GameFrame<S> };

type ClientSubscriptionMethods<S extends Spec> = {
  subscribe: Subscribable<ClientOutput<S>>["subscribe"];
  get: Subscribable<ClientOutput<S>>["get"];
};

export type Client<S extends Spec> = ClientSubscriptionMethods<S> &
  ClientProps<S>;

export function createClient<S extends Spec>(
  server: ServerApi<S> | string,
  cart: Cart<S>
): Client<S> {
  let frame: Frame<S> = {
    connected: false,
    room: null,
    state: null,
    ctx: null,
    action: null,
    err: null,
  };
  let statusRef = { current: frame };
  function set(update: Partial<Frame<S>>) {
    frame = { ...frame, ...update };
    statusRef.current = frame;
  }

  const store = createSubscribable({ view: "title", frame } as ClientOutput<S>);

  const meter = createMeter<MeterState<S>>({ state: null, action: null });

  function update() {
    if (!frame.room) {
      store.next({ view: "title", frame: frame as TitleFrame<S> });
    }
    if (frame.room && !frame.state)
      store.next({ view: "lobby", frame: frame as LobbyFrame<S> });
    if (frame.room && frame.state)
      store.next({ view: "game", frame: frame as GameFrame<S> });
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

      if (room) {
        mod.room = room;
      } else if (room === null) {
        lastUpdate = null;
        mod.room = null;
        mod.ctx = null;
        mod.state = null;
        meterActions.push(meter.actions.reset);
      }

      if (cartErr) {
        mod.err = { type: "cartErr", msg: cartErr };
      }

      if (serverErr) {
        mod.err = { type: "serverErr", msg: serverErr };
      }

      if (cartUpdate) {
        const { ctx, prev, patches, action } = cartUpdate;
        const meterStates: MeterState<S>[] = [];

        if (!frame.ctx) {
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
        if (!mod.state) update();
      } else {
        update();
      }
    },
  });

  meter.subscribe((curr, prev) => {
    if (curr.state === prev.state) return;
    set(curr.state);
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

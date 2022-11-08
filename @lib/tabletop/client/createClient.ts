import { createEmitter, createSetFn, ReadOnlyEmitter } from "@lib/emitter";
import { Meter, createMeter } from "@lib/meter";
import { createSocketManager } from "@lib/socket";

import { Spec } from "../core/spec";
import { AuthAction, Ctx } from "../core/chart";
import { Cart } from "../core/cart";

import { ServerActions, actionKeys, ServerApi } from "../server/createServer";
import { RoomData } from "../server/routines";
import { CartUpdate } from "../core/store";

export type AppState<S extends Spec> = {
  connected: boolean;
  err: { type: "serverErr" | "cartErr"; msg: string } | null;
  action: null | AuthAction<S>;
} & (
  | /* Title */ { room: null; ctx: null; game: null }
  | /* Lobby */ { room: RoomData; ctx: Ctx<S>; game: null }
  | /* Game */ {
      room: RoomData;
      ctx: Ctx<S>;
      game: S["game"];
    }
);

export type MeterState<S extends Spec> = {
  game: S["game"] | null;
  action: AuthAction<S> | null;
};

export type Client<S extends Spec> = {
  emitter: ReadOnlyEmitter<AppState<S>>;
  serverActions: ActionFns<ServerActions<S>>;
  cartActions: ActionFns<S["actions"]>;
  meter: Meter<MeterState<S>>;
  cart: Cart<S>;
};

export function createClient<S extends Spec>(
  server: ServerApi<S> | string,
  cart: Cart<S>
): Client<S> {
  let appState: AppState<S> = {
    connected: false,
    room: null,
    game: null,
    ctx: null,
    action: null,
    err: null,
  };

  const emitter = createEmitter<AppState<S>>(appState);
  const set = createSetFn(emitter);
  const meter = createMeter<MeterState<S>>({ game: null, action: null });

  let lastCartUpdate: CartUpdate<S> | null = null;
  const socket = createSocketManager(server, {
    onopen: () => set({ connected: true }),
    onclose: () => set({ connected: false }),
    onmessage: (res) => {
      const { room, cartUpdate, cartErr, serverErr } = res;

      const update: Partial<AppState<S>> = {};
      let pendingMeterActions: Function[] = [];

      if (room) {
        update.room = room;
      } else if (room === null) {
        // Reset state
        lastCartUpdate = null;
        update.room = null;
        update.ctx = null;
        update.game = null;
        pendingMeterActions.push(meter.reset);
      }

      if (cartErr) {
        update.err = { type: "cartErr", msg: cartErr };
      }

      if (serverErr) {
        update.err = { type: "serverErr", msg: serverErr };
      }

      if (cartUpdate) {
        const { ctx, prevGame, games, action } = cartUpdate;
        const meterStates: MeterState<S>[] = [];

        update.ctx = ctx;

        if (!lastCartUpdate) {
          meterStates.push({ game: prevGame, action: null });
        }

        const meterUpdates = games.map((game, idx) => {
          if (idx === 0 && action) return { game, action };
          return { game, action: null };
        });
        meterStates.push(...meterUpdates);

        if (meterStates.length > 0) {
          pendingMeterActions.push(() => meter.pushStates(...meterStates));
        }

        lastCartUpdate = cartUpdate;
      }

      if (pendingMeterActions.length > 0) {
        set(update); // TK make silent
        pendingMeterActions.forEach((fn) => fn());
      } else {
        set(update);
      }
    },
  });

  meter.emitter.subscribe((curr, prev) => {
    if (curr.state === prev.state) return;
    const { game, action } = curr.state;
    if (game) set({ game, action });
  });

  const serverActions = createServerActionFns(actionKeys, socket) as ActionFns<
    ServerActions<S>
  >;
  const cartActions = createCartActionFns(cart, socket) as ActionFns<
    S["actions"]
  >;

  socket.open();

  return {
    emitter,
    serverActions,
    cartActions,
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
  socket: { send: Function }
) {
  const actions: Record<string, any> = {};
  Object.keys(cart.actionKeys).forEach((type) => {
    actions[type] = (data: any) => {
      const action = {
        type,
        data,
      };
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

import {
  createEmitter,
  createSetFn,
  ReadOnlyEmitter,
  withSelector,
} from "@lib/emitter";
import { Meter, createMeter } from "@lib/meter";
import { createSocketManager } from "@lib/socket";
import { shallow, deepPatch } from "@lib/compare";

import { Spec } from "../core/spec";
import { AuthAction, Ctx } from "../core/chart";
import { Cart, getCtx } from "../core/cart";
import { SocketMeta } from "../server";
import { ServerActions, actionKeys, ServerApi } from "../server/createServer";

import {
  ActionFns,
  createCartActionFns,
  createServerActionFns,
} from "./createActionFns";

export type AppState = {
  mode: "title" | "lobby" | "game";
  connected: boolean;
  loc: {
    id: string;
    playerIndex: number;
    started: boolean;
  };
  sockets: (SocketMeta | null)[];
  err: { msg: string } | null;
};

export type GameState<S extends Spec> = {
  playerIndex: number;
  game: S["game"];
  action: AuthAction<S> | null;
  ctx: Ctx<S>;
};

export type Client<S extends Spec> = {
  appEmitter: ReadOnlyEmitter<AppState>;
  gameEmitter: ReadOnlyEmitter<GameState<S>>;
  serverActions: ActionFns<ServerActions<S>>;
  cartActions: ActionFns<S["actions"]>;
  gameMeter: Meter<GameState<S> | null>;
  cart: Cart<S>;
};

export function createClient<S extends Spec>(
  server: ServerApi<S> | string,
  cart: Cart<S>
): Client<S> {
  function getInitialAppState(connected = false): AppState {
    return {
      connected,
      mode: "title",
      loc: { id: "", playerIndex: -1, started: false },
      sockets: [],
      err: null,
    };
  }

  const appEmitter = createEmitter(getInitialAppState());
  const setApp = createSetFn(appEmitter);

  const _ctx = getCtx(cart);
  const _game = cart.getInitialGame(_ctx);
  function getInitialGameState(): GameState<S> {
    return {
      playerIndex: 0,
      game: _game,
      action: null,
      ctx: _ctx,
    };
  }

  const gameMeter = createMeter<GameState<S> | null>(null);
  const gameEmitter = createEmitter(getInitialGameState());
  withSelector(
    gameMeter.emitter,
    (x) => x.state,
    (state) => {
      if (state === null) return;
      gameEmitter.next(state);
    }
  );

  const socket = createSocketManager(server, {
    onopen: () => setApp({ connected: true }),
    onclose: () => setApp({ connected: false }),
    onmessage: (res) => {
      const currAppState = appEmitter.get();

      if (res.loc === null) {
        appEmitter.next(getInitialAppState(currAppState.connected));
        gameMeter.reset(null);
        return;
      }

      if (res.loc) {
        if (!shallow(res.loc, currAppState.loc)) {
          setApp({ mode: res.loc.started ? "game" : "lobby", loc: res.loc });
        }
      }

      if (res.sockets) {
        if (!shallow(res.sockets, currAppState.sockets)) {
          setApp({ sockets: res.sockets });
        }
      }

      if (res.serverErr || res.cartErr) {
        setApp({
          err: { msg: (res.serverErr || res.cartErr) as string },
        });
      } else if (currAppState.err !== null) {
        setApp({ err: null });
      }

      // > Game
      if (res.cartUpdate) {
        const { cartUpdate } = res;

        const meterState = gameMeter.emitter.get();
        const latestMeterGame = meterState.states.at(-1) || meterState.state;

        const patchedGames = cartUpdate.games.map((game, idx) => {
          const prev = cartUpdate.games[idx - 1] || latestMeterGame?.game || {};
          return deepPatch(game, prev);
        });

        if (latestMeterGame === null) patchedGames.unshift(cartUpdate.prevGame);

        const meterUpdates = patchedGames.map((game, idx) => ({
          game,
          action: idx === 0 ? cartUpdate.action || null : null,
          playerIndex: cartUpdate.playerIndex,
          ctx: cartUpdate.ctx,
        }));

        setApp({
          mode: "game",
        });

        gameMeter.pushStates(...meterUpdates);
      }
    },
  });

  const serverActions = createServerActionFns(actionKeys, socket) as ActionFns<
    ServerActions<S>
  >;
  const cartActions = createCartActionFns(cart, socket) as ActionFns<
    S["actions"]
  >;

  socket.open();

  return {
    appEmitter,
    gameEmitter,
    serverActions,
    cartActions,
    gameMeter,
    cart,
  };
}

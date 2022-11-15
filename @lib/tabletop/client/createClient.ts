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
import { AuthAction, Ctx } from "../core/reducer";
import { Game, getCtx } from "../core/game";
import { SocketMeta } from "../server";
import { ServerActions, actionKeys, ServerApi } from "../server/createServer";

import {
  ActionFns,
  createGameActionFns,
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

export type GameFrame<S extends Spec> = {
  playerIndex: number;
  board: S["board"];
  action: AuthAction<S> | null;
  ctx: Ctx<S>;
};

export type Client<S extends Spec> = {
  appEmitter: ReadOnlyEmitter<AppState>;
  gameEmitter: ReadOnlyEmitter<GameFrame<S>>;
  serverActions: ActionFns<ServerActions<S>>;
  gameActions: ActionFns<S["actions"]>;
  gameMeter: Meter<GameFrame<S> | null>;
  game: Game<S>;
};

export function createClient<S extends Spec>(
  server: ServerApi<S> | string,
  game: Game<S>
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

  const _ctx = getCtx(game);
  const _board = game.getInitialBoard(_ctx);
  function getInitialGameFrame(): GameFrame<S> {
    return {
      playerIndex: 0,
      board: _board,
      action: null,
      ctx: _ctx,
    };
  }

  const gameMeter = createMeter<GameFrame<S> | null>(null);
  const gameEmitter = createEmitter(getInitialGameFrame());
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

      if (res.serverErr || res.gameErr) {
        setApp({
          err: { msg: (res.serverErr || res.gameErr) as string },
        });
      } else if (currAppState.err !== null) {
        setApp({ err: null });
      }

      // > Game
      if (res.gameUpdate) {
        const { gameUpdate } = res;

        const meterState = gameMeter.emitter.get();
        const latestMeterBoard = meterState.states.at(-1) || meterState.state;

        const patchedBoards = gameUpdate.boards.map((game, idx) => {
          const prev =
            gameUpdate.boards[idx - 1] || latestMeterBoard?.board || {};
          return deepPatch(game, prev);
        });

        if (latestMeterBoard === null)
          patchedBoards.unshift(gameUpdate.prevBoard);

        const meterUpdates = patchedBoards.map((board, idx) => ({
          board,
          action: idx === 0 ? gameUpdate.action || null : null,
          playerIndex: gameUpdate.playerIndex,
          ctx: gameUpdate.ctx,
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
  const gameActions = createGameActionFns(game, socket) as ActionFns<
    S["actions"]
  >;

  socket.open();

  return {
    appEmitter,
    gameEmitter,
    serverActions,
    gameActions,
    gameMeter,
    game,
  };
}

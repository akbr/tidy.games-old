import { createEmitter, ReadOnlyEmitter, withSelector } from "@lib/emitter";
import { Meter, createMeter } from "@lib/meter";
import { createSocketManager } from "@lib/socket";
import { shallow, deepPatch } from "@lib/compare";

import { Spec } from "../core/spec";
import { AuthAction, Ctx } from "../core/reducer";
import { Game } from "../core/game";
import { ServerActions, actionKeys, ServerApi, SocketsStatus } from "../server";

import {
  ActionFns,
  createGameActionFns,
  createServerActionFns,
} from "./createActionFns";

export type AppState = {
  connected: boolean;
  err: { msg: string } | null;
};

export type Room = {
  id: string;
  playerIndex: number;
  socketsStatus: SocketsStatus;
};

export type GameState<S extends Spec> = {
  board: S["board"];
  action: AuthAction<S> | null;
  ctx: Ctx<S>;
};

export type ClientState<S extends Spec> =
  | ({ mode: "title" } & AppState)
  | ({ mode: "lobby" } & AppState & Room)
  | ({ mode: "game" } & AppState & Room & GameState<S>);

export type Client<S extends Spec> = {
  emitter: ReadOnlyEmitter<ClientState<S>>;
  serverActions: ActionFns<ServerActions<S>>;
  gameActions: ActionFns<S["actions"]>;
  gameMeter: Meter<GameState<S> | null>;
  game: Game<S>;
};

export function createClient<S extends Spec>(
  server: ServerApi<S> | string,
  game: Game<S>
): Client<S> {
  // Internal Memory
  // ---------------
  let connected = false;
  let err: { msg: string } | null = null;
  let room: Room | null = null;
  let socketsStatus: SocketsStatus = [];
  let gameState = {} as GameState<S>;

  let _started = false;
  // -----------------

  const emitter = createEmitter({
    mode: "title",
    connected,
    err,
  } as ClientState<S>);

  const gameMeter = createMeter<GameState<S> | null>(null);
  withSelector(
    gameMeter.emitter,
    (x) => x.state,
    (state) => {
      if (state) {
        gameState = state;
        releaseState();
        Promise.resolve().then(gameMeter.unlock);
      }
      err = null;
    }
  );

  function releaseState() {
    const state = {
      mode: !room ? "title" : !_started ? "lobby" : "game",
      connected,
      err,
      ...(room || {}),
      socketsStatus,
      ...gameState,
    } as const;

    emitter.next(state as ClientState<S>);
  }

  const socket = createSocketManager(server, {
    onopen: () => {
      connected = true;
      releaseState();
    },
    onclose: () => {
      connected = false;
      releaseState();
    },
    onmessage: (res) => {
      if (res.serverErr) {
        err = { msg: res.serverErr };
      }

      if (res.loc === null) {
        room = null;
        gameMeter.reset(null);
        releaseState();
        return;
      }

      if (res.gameErr) {
        err = { msg: res.gameErr };
      }

      //TK
      if (res.historyString) {
        console.log(`http://localhost:3000/analyze.html#` + res.historyString);
        return;
      }

      const { id, playerIndex, started } = res.loc;
      const nextLoc = { id, playerIndex };

      _started = started;
      socketsStatus = res.socketsStatus || socketsStatus;
      room = {
        ...nextLoc,
        socketsStatus,
      };

      if (res.gameUpdate) {
        const { gameUpdate } = res;
        let patchedBoards = gameUpdate.boardSet.map((board, idx) => {
          const prev = gameUpdate.boardSet[idx - 1] || gameUpdate.prevBoard;
          return deepPatch(board, prev);
        });
        const meterUpdates = patchedBoards.map((board, idx) => ({
          board,
          action: idx === 0 ? gameUpdate.action || null : null,
          ctx: gameUpdate.ctx,
        }));
        gameMeter.pushStates(...meterUpdates);
      }

      releaseState();
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
    emitter,
    serverActions,
    gameActions,
    gameMeter,
    game,
  };
}

export default createClient;

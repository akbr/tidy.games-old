import { createEmitter, ReadOnlyEmitter, withSelector } from "@lib/emitter";
import { Meter, createMeter } from "@lib/meter";
import { createSocketManager } from "@lib/socket";
import { deepPatch } from "@lib/compare";

import { Spec } from "../core/spec";
import { PlayerAction, Ctx } from "../core/game";
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

type RoomState = {
  id: string;
  playerIndex: number;
  socketsStatus: SocketsStatus;
};

export type GameState<S extends Spec> = {
  board: S["board"];
  action: PlayerAction<S> | null;
  ctx: Ctx<S>;
};

export type ClientState<S extends Spec> =
  | ({ mode: "title" } & AppState)
  | ({ mode: "lobby" } & AppState & RoomState)
  | ({ mode: "game" } & AppState & RoomState & GameState<S>);

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
  let id: string | null = null;
  let playerIndex: number | null = null;
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
        setTimeout(gameMeter.unlock, 0);
      }
    }
  );

  function releaseState() {
    const state = {
      mode: !id ? "title" : !_started ? "lobby" : "game",
      connected,
      err,
      id,
      playerIndex,
      socketsStatus,
      ...gameState,
    };

    err = null;

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
        id = null;
        playerIndex = null;
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

      _started = res.loc.started;
      id = res.loc.id;
      playerIndex = res.loc.playerIndex;
      socketsStatus = res.socketsStatus || socketsStatus;

      if (res.gameUpdate) {
        const { gameUpdate } = res;
        let patchedBoards = gameUpdate.boards.map((board, idx) => {
          const prev = gameUpdate.boards[idx - 1] || gameUpdate.prevBoard;
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

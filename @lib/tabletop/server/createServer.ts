import { Game, Spec } from "../core";
import {
  ServerActions,
  ServerApi,
  ServerSocket,
  SocketMeta,
  ServerOutputData,
  Room,
} from "./types";

import { createGameStore } from "../core/store";
import { createBotSocket } from "./createBotSocket";
import { createGameHost } from "./createGameHost";
import { encodeHistory, getRandomRoomID, getSeatNumber } from "./utils";

export function createServer<S extends Spec>(game: Game<S>) {
  // State
  const roomMap = new Map<string, Room<S>>();
  const botMap = new Set<ServerSocket<S>>();
  const socketMap = {
    room: new Map<ServerSocket<S>, string>(),
    meta: new Map<ServerSocket<S>, SocketMeta>(),
  };

  // Dispatch (ensures all socket messages have a loc)
  function dispatch(
    socket: ServerSocket<S>,
    data = {} as Partial<ServerOutputData<S>>
  ) {
    const loc = getLoc(socket);
    if (!loc) {
      socket.send({ loc: null, serverErr: data.serverErr });
      return;
    }
    socket.send({ loc, ...data });
  }

  // Server API (central routing)
  const serverApi: ServerApi<S> = {
    onopen: (socket) => {
      dispatch(socket);
    },
    onclose: (socket) => {
      onLeave(socket);
    },
    onmessage: (socket, { to, msg }) => {
      if (to === "server") {
        if (msg.type === "setMeta") {
          onSetMeta(socket, msg.data);
          return;
        }

        if (msg.type === "join") {
          onLeave(socket);
          const serverErr = onJoin(socket, msg.data?.id, msg.data?.playerIndex);
          if (serverErr) dispatch(socket, serverErr);
          return;
        }

        if (msg.type === "leave") {
          onLeave(socket);
          return;
        }

        if (msg.type === "addBot") {
          const serverErr = onAddBot(socket, serverApi);
          if (serverErr) dispatch(socket, serverErr);
          return;
        }

        if (msg.type === "start") {
          let serverErr = onStart(socket, msg.data);
          if (serverErr) dispatch(socket, serverErr);
          return;
        }

        if (msg.type === "getHistoryString") {
          let serverErr = getHistoryString(socket);
          if (serverErr) dispatch(socket, serverErr);
          return;
        }

        dispatch(socket, { serverErr: "Invalid server action type." });
        return;
      }

      if (to === "game") {
        const serverErr = onSubmit(socket, msg);
        if (serverErr) dispatch(socket, serverErr);
        return;
      }

      dispatch(socket, { serverErr: "Invalid top-level action type." });
    },
  };

  // Gets
  function getRoom(key?: ServerSocket<S> | string) {
    if (!key) return;
    if (typeof key === "string") return roomMap.get(key);
    let roomId = socketMap.room.get(key);
    if (roomId) return roomMap.get(roomId);
  }

  function getLoc(socket: ServerSocket<S>) {
    const room = getRoom(socket);
    if (room)
      return {
        id: room.id,
        playerIndex: room.sockets.indexOf(socket),
        started: Boolean(room.host),
      };
  }

  function getSocketsStatus(room: Room<S>) {
    return room.sockets.map((socket) =>
      socket ? socketMap.meta.get(socket) || {} : null
    );
  }

  // Sets
  function setMeta(socket: ServerSocket<S>, meta: SocketMeta) {
    const metaUpdate = socketMap.meta.get(socket) || {};
    socketMap.meta.set(socket, { ...meta, ...metaUpdate });
  }

  function createRoom(requestId?: string) {
    const id = requestId || getRandomRoomID();
    roomMap.set(id, {
      id,
      sockets: [],
    });
    return roomMap.get(id)!;
  }

  // Utils
  function broadcastSocketsUpdate(room: Room<S>) {
    room.sockets.forEach(
      (socket) =>
        socket && dispatch(socket, { socketsStatus: getSocketsStatus(room) })
    );
  }

  function clearSocket(socket: ServerSocket<S>) {
    socketMap.room.delete(socket);
    botMap.delete(socket);
    dispatch(socket);
  }

  // Compound
  function onSetMeta(socket: ServerSocket<S>, meta: SocketMeta) {
    setMeta(socket, meta);
    const room = getRoom(socket);
    if (room) broadcastSocketsUpdate(room);
  }

  function onJoin(
    socket: ServerSocket<S>,
    id?: string,
    requestedSeat?: number
  ) {
    const room = getRoom(id) || createRoom(id);

    const seatIndex = getSeatNumber(
      room.sockets,
      game.meta.players,
      requestedSeat
    );

    if (typeof seatIndex === "string") return { serverErr: seatIndex };

    room.sockets[seatIndex] = socket;
    socketMap.room.set(socket, room.id);

    broadcastSocketsUpdate(room);
  }

  function onAddBot(socket: ServerSocket<S>, server: ServerApi<S>) {
    if (!game.botFn) {
      return { serverErr: "Game has no botFn." };
    }

    const room = getRoom(socket);
    if (!room) {
      return { serverErr: "Socket not in a room" };
    }

    const botSocket = createBotSocket(game.botFn, server);
    botMap.add(botSocket);
    socketMap.meta.set(botSocket, { avatar: "🤖", name: "BOT" });

    const err = onJoin(botSocket, room.id);

    if (err) {
      botMap.delete(botSocket);
      return err;
    }
  }

  function onStart(
    socket: ServerSocket<S>,
    startOptions?: Extract<ServerActions<S>, { type: "start" }>["data"]
  ) {
    const room = getRoom(socket);
    if (!room) return { serverErr: "You're not in a room!" };

    if (room.sockets.indexOf(socket) !== 0)
      return { serverErr: "You must be the first player to start the game." };

    const numPlayers = room.sockets.length;
    const { seed, options } = startOptions || {};

    const ctx = {
      numPlayers,
      options: game.getOptions(numPlayers, options),
      seed,
    };

    const store = createGameStore(game, ctx);
    if (typeof store === "string")
      return { serverErr: `Game error when starting game: ${store}` };

    room.store = store;
    room.host = createGameHost(room.store, {
      onUpdate: (playerIndex, gameUpdate) => {
        const socket = room.sockets[playerIndex];
        socket && dispatch(socket, { gameUpdate });
      },
      onErr: (playerIndex, gameErr) => {
        const socket = room.sockets[playerIndex];
        socket && dispatch(socket, { gameErr });
      },
    });

    room.host.update();
  }

  function onSubmit(socket: ServerSocket<S>, action: S["actions"]) {
    const room = getRoom(socket);

    if (!room) return { serverErr: "You are not in a room." };
    if (!room.host) return { serverErr: "This room's game has not started." };

    const playerIndex = room.sockets.indexOf(socket);
    room.host.submit({ playerIndex, action });
  }

  function getHistoryString(socket: ServerSocket<S>) {
    const room = getRoom(socket);
    if (!room) return { serverErr: "You are not in a room." };
    if (!room.store) return { serverErr: "This room's game has not started." };
    const history = room.store.getHistory();
    const historyString = encodeHistory(history);
    dispatch(socket, { historyString });
  }

  function onLeave(socket: ServerSocket<S>) {
    const room = getRoom(socket);
    if (!room) return clearSocket(socket);

    const seatIndex = room.sockets.indexOf(socket);
    room.sockets[seatIndex] = null;

    clearSocket(socket);

    const numHumansLeft = room.sockets.filter(
      (s) => s && !botMap.has(s)
    ).length;

    if (numHumansLeft === 0) {
      room.sockets.forEach((socket) => socket && clearSocket(socket));
      roomMap.delete(room.id);
    } else {
      broadcastSocketsUpdate(room);
    }
  }

  return serverApi;
}

export const actionKeys = {
  setMeta: null,
  join: null,
  leave: null,
  addBot: null,
  start: null,
  getHistoryString: null,
};

export default createServer;

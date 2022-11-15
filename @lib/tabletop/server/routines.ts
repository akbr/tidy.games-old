import { is } from "@lib/compare";

import type { Spec } from "../core/spec";
import type { Game } from "../core/game";
import { GameStore, createGameStore } from "../core/store";

import type { ServerSocket, ServerApi, ServerActions } from "./createServer";
import { getRandomRoomID, getSeatNumber } from "./utils";
import { GameHost, createBotSocket, createGameHost } from "./wrappers";

export type Room<S extends Spec> = {
  id: string;
  seats: (ServerSocket<S> | null)[];
  store: GameStore<S> | null;
  host?: GameHost<S>;
};

export type RoomStatus = {
  id: string;
  playerIndex: number;
  started: boolean;
};

export type SocketMeta = {
  avatar?: string;
  name?: string;
};
export type Sockets = (SocketMeta | null)[];

export const createRoutines = <S extends Spec>(game: Game<S>) => {
  const rooms = new Map<string, Room<S>>();
  const sockets = {
    room: new Map<ServerSocket<S>, string>(),
    meta: new Map<ServerSocket<S>, SocketMeta>(),
    bot: new Set<ServerSocket<S>>(),
  };

  function getRoomStatus<S extends Spec>(
    room: Room<S>,
    socket: ServerSocket<S>
  ): RoomStatus {
    return {
      id: room.id,
      started: !!room.host,
      playerIndex: room.seats.indexOf(socket),
    };
  }

  // ---

  function setMeta(socket: ServerSocket<S>, nextMeta: SocketMeta) {
    const meta = sockets.meta.get(socket) || {};
    sockets.meta.set(socket, { ...meta, ...nextMeta });
  }

  function createRoom(requestId?: string) {
    const id = requestId || getRandomRoomID();
    const room: Room<S> = {
      id,
      seats: [],
      store: null,
    };
    rooms.set(id, room);
    return room;
  }

  function getRoomOf(socket: ServerSocket<S>) {
    const id = sockets.room.get(socket);
    return id ? rooms.get(id) : undefined;
  }

  function joinRoom(
    socket: ServerSocket<S>,
    id?: string,
    requestedSeat?: number
  ) {
    const room = id ? rooms.get(id) || createRoom(id) : createRoom();
    const seatIndex = getSeatNumber(
      room.seats,
      game.meta.players,
      requestedSeat
    );

    if (typeof seatIndex === "string") return seatIndex;

    room.seats[seatIndex] = socket;
    sockets.room.set(socket, room.id);

    broadcastRoomStatusOf(socket);
    room.host?.setSocket(seatIndex, socket);
  }

  function broadcastRoomStatusOf(socket: ServerSocket<S>) {
    const room = getRoomOf(socket);
    if (room) broadcastRoomStatus(room);
  }

  function broadcastRoomStatus(room: Room<S>) {
    const s = room.seats.map((s) => (s ? sockets.meta.get(s) || null : null));

    room.seats.forEach((socket, player) => {
      socket &&
        socket.send({
          loc: getRoomStatus(room, socket),
          sockets: s,
        });
    });
  }

  function startGame(
    socket: ServerSocket<S>,
    msg?: Extract<ServerActions<S>, { type: "start" }>["data"]
  ) {
    const room = getRoomOf(socket);
    if (!room) return "You're not in a room!";

    if (room.seats.indexOf(socket) !== 0)
      return "You must be the first player to start the game.";

    const numPlayers = room.seats.length;
    const { seed, options } = msg || {};

    const ctx = {
      numPlayers,
      options: game.getOptions(numPlayers, options),
      seed,
    };
    const store = createGameStore(game, ctx);
    if (is.string(store)) return store;
    room.host = createGameHost(store);

    broadcastRoomStatus(room);
    room.seats.forEach((socket, idx) => {
      room.host!.setSocket(idx, socket);
    });
  }

  function addBot(socket: ServerSocket<S>, server: ServerApi<S>) {
    if (!game.botFn) return "Game has no botFn.";
    const room = getRoomOf(socket);
    if (!room) return "Socket not in a room";

    const botSocket = createBotSocket(game.botFn, server);
    sockets.bot.add(botSocket);
    sockets.meta.set(botSocket, { avatar: "🤖", name: "BOT" });

    const err = joinRoom(botSocket, room.id);
    if (err) {
      sockets.bot.delete(botSocket);
      return err;
    }
  }

  function submitAction(socket: ServerSocket<S>, action: S["actions"]) {
    const room = getRoomOf(socket);
    if (!room) return "You are not in a room.";
    if (!room.host) return "This room's game has not started.";
    const socketIndex = room.seats.indexOf(socket);

    const err = room.host.submit(socketIndex, action);
    if (err) return err;
  }

  function leaveRoom(socket: ServerSocket<S>) {
    const room = getRoomOf(socket);
    if (!room) return;

    const seatIndex = room.seats.indexOf(socket);
    if (seatIndex !== -1) {
      room.seats[seatIndex] = null;
      room.host?.setSocket(seatIndex, null);
    } else {
      return "Socket is in a room but not in a seat. (Huh? This shouldn't happen.)";
    }

    clearSocket(socket);

    const noHumans =
      room.seats.filter((s) => {
        if (!s) return false;
        return !sockets.bot.has(s);
      }).length === 0;

    if (noHumans) {
      room.seats.forEach(clearSocket);
      rooms.delete(room.id);
    } else {
      broadcastRoomStatus(room);
    }
  }

  function clearSocket(socket: ServerSocket<S> | null) {
    if (!socket) return;
    sockets.room.delete(socket);
    sockets.bot.delete(socket);
    socket.send({ loc: null });
  }

  return {
    setMeta,
    createRoom,
    getRoomOf,
    joinRoom,
    broadcastRoomStatusOf,
    broadcastRoomStatus,
    startGame,
    addBot,
    submitAction,
    leaveRoom,
    clearSocket,
  };
};

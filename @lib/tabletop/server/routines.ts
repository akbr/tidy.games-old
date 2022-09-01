import { is } from "@lib/compare/is";

import type { Spec } from "../core/spec";
import type { Cart } from "../core/cart";
import { CartStore, createCartStore } from "../core/store";

import type { ServerSocket, ServerApi, ServerActions } from "./createServer";
import { getRandomRoomID, getSeatNumber } from "./utils";
import { CartHost, createBotSocket, createCartHost } from "./wrappers";

export type Room<S extends Spec> = {
  id: string;
  seats: (ServerSocket<S> | null)[];
  store: CartStore<S> | null;
  host?: CartHost<S>;
};

export type RoomData = {
  id: string;
  seats: (SocketMeta | null)[];
  player: number;
  started: boolean;
};

export type SocketMeta = {
  avatar?: string;
  name?: string;
};

export const createRoutines = <S extends Spec>(cart: Cart<S>) => {
  const rooms = new Map<string, Room<S>>();
  const sockets = {
    room: new Map<ServerSocket<S>, string>(),
    meta: new Map<ServerSocket<S>, SocketMeta>(),
    bot: new Set<ServerSocket<S>>(),
  };

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
      cart.meta.players,
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
    const seats = room.seats.map((socket) =>
      socket ? sockets.meta.get(socket) || {} : null
    );

    room.seats.forEach((socket, player) => {
      socket &&
        socket.send({
          room: {
            id: room.id,
            player,
            seats,
            started: room.host ? true : false,
          },
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
      options: cart.getOptions(numPlayers, options),
      seed,
    };
    const store = createCartStore(cart, ctx);
    if (is.string(store)) return store;
    room.host = createCartHost(store);

    broadcastRoomStatusOf(socket);
    room.seats.forEach((socket, idx) => {
      room.host!.setSocket(idx, socket);
    });
  }

  function addBot(socket: ServerSocket<S>, server: ServerApi<S>) {
    if (!cart.botFn) return "Game has no botFn.";
    const room = getRoomOf(socket);
    if (!room) return "Socket not in a room";

    const botSocket = createBotSocket(cart.botFn, server);
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
    socket.send({ room: null });
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

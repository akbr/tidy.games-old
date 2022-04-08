import type { Spec } from "../spec";
import type { Cart } from "../cart";
import { Machine, createMachine } from "../machine";

import type { ServerSocket, ServerOptions, SocketMeta, ServerApi } from "./";
import {
  MachineServer,
  createMachineServer,
  createBotSocket,
} from "./wrappers";
import { getRandomRoomID, getSeatNumber } from "./utils";

export type Room<S extends Spec> = {
  id: string;
  seats: (ServerSocket<S> | null)[];
  machine: Machine<S> | null;
  machineServer: MachineServer<S> | null;
};

export const createMethods = <S extends Spec>(
  cart: Cart<S>,
  serverOptions?: ServerOptions
) => {
  const rooms = new Map<string, Room<S>>();
  const sockets = {
    room: new Map<ServerSocket<S>, string>(),
    meta: new Map<ServerSocket<S>, SocketMeta>(),
    bot: new Set<ServerSocket<S>>(),
  };

  function setMeta(
    socket: ServerSocket<S>,
    nextMeta: { name?: string; avatar?: string }
  ) {
    const meta = sockets.meta.get(socket) || ({} as SocketMeta);
    sockets.meta.set(socket, { ...meta, ...nextMeta });
  }

  function createRoom(requestId?: string) {
    const id = requestId ? requestId : getRandomRoomID();
    const room: Room<S> = {
      id,
      seats: [],
      machine: null,
      machineServer: null,
    };
    rooms.set(id, room);
    return room;
  }

  function getSocketRoom(socket: ServerSocket<S>) {
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

    if (typeof seatIndex === "string") {
      return seatIndex;
    }

    room.seats[seatIndex] = socket;
    sockets.room.set(socket, room.id);

    broadcastRoomStatusFor(socket);
    room.machineServer?.setSocket(seatIndex, socket);
  }

  function broadcastRoomStatusFor(socket: ServerSocket<S>) {
    const room = getSocketRoom(socket);
    if (!room) return;

    const seats = room.seats.map((socket) =>
      socket ? sockets.meta.get(socket) || ({} as SocketMeta) : null
    );

    room.seats.forEach((socket, player) => {
      socket!.send([
        "server",
        {
          id: room.id,
          player,
          seats,
          started: room.machineServer ? true : false,
        },
      ]);
    });
  }

  function startGame(socket: ServerSocket<S>, options?: S["options"]) {
    const room = getSocketRoom(socket);
    if (!room) return "You're not even in a room!";

    if (room.seats.indexOf(socket) !== 0)
      return "You have to be the first player to start the game.";

    const numPlayers = room.seats.length;
    const ctx = {
      numPlayers,
      options: cart.setOptions(numPlayers, options),
      seed: serverOptions ? serverOptions.seed : undefined,
    };
    const machine = createMachine(cart, ctx);

    if (typeof machine === "string") return machine;

    room.machine = machine;
    room.machineServer = createMachineServer(machine);
    broadcastRoomStatusFor(socket);
    room.seats.forEach((socket, idx) => {
      room.machineServer!.setSocket(idx, socket);
    });
  }

  function addBot(socket: ServerSocket<S>, server: ServerApi<S>) {
    if (!cart.botFn) return "Game has no botFn.";
    const room = getSocketRoom(socket);
    if (!room) return "Socket not in a room";
    const botSocket = createBotSocket(cart.botFn, server);
    sockets.bot.add(botSocket);
    sockets.meta.set(botSocket, { avatar: "🤖", name: "BOT" });
    const err = joinRoom(botSocket, room.id);
    if (err) return err;
  }

  function submitAction(socket: ServerSocket<S>, action: S["actions"]) {
    const room = getSocketRoom(socket);
    if (!room) return "You are not in a room.";
    if (!room.machineServer) return "This room's game has not started.";
    const socketIndex = room.seats.indexOf(socket);
    const err = room.machineServer.submit(socketIndex, action);
    if (err) return err;
  }

  function leaveRoom(socket: ServerSocket<S>) {
    const room = getSocketRoom(socket);
    if (!room) return;

    const seatIndex = room.seats.indexOf(socket);
    if (seatIndex !== -1) {
      room.seats[seatIndex] = null;
      room.machineServer?.setSocket(seatIndex, null);
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
    }
  }

  function clearSocket(s: ServerSocket<S> | null) {
    if (!s) return;
    sockets.room.delete(s);
    sockets.bot.delete(s);
    s.send(["server", null]);
  }

  return {
    addBot,
    joinRoom,
    startGame,
    submitAction,
    leaveRoom,
    setMeta,
    broadcastRoomStatusFor,
  };
};

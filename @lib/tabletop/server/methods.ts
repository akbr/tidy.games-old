import { Spec, GameDefinition } from "../types";
import { Machine, createMachine } from "../machine";

import type { ServerSocket, ServerOptions, ServerApi } from "./";
import { GameMaster, createGameMaster } from "./gameMaster";
import { getRandomRoomID, getSeatNumber } from "./utils";
import { createLocalSocketPair } from "@lib/socket";

export type Room<S extends Spec> = {
  id: string;
  seats: (ServerSocket<S> | null)[];
  machine: Machine<S> | null;
  gameMaster: GameMaster<S> | null;
};

export const createMethods = <S extends Spec>(
  gameDefinition: GameDefinition<S>,
  serverOptions?: ServerOptions
) => {
  const rooms: Map<string, Room<S>> = new Map();
  const sockets: Map<ServerSocket<S>, string> = new Map();

  const avatars = ["🦊", "🐷", "🐔", "🐻", "🐭", "🦁"];
  const botAvatar = "🤖";

  function createRoom(requestId?: string) {
    const id = requestId ? requestId : getRandomRoomID();
    const room: Room<S> = {
      id,
      seats: [],
      machine: null,
      gameMaster: null,
    };
    rooms.set(id, room);
    return room;
  }

  function getSocketRoom(socket: ServerSocket<S>) {
    const id = sockets.get(socket);
    return id ? rooms.get(id) : undefined;
  }

  function joinRoom(
    socket: ServerSocket<S>,
    id?: string,
    requestedSeat?: number
  ) {
    const room = id ? rooms.get(id) || createRoom(id) : createRoom();
    const seatIndex = getSeatNumber(room.seats, requestedSeat);

    if (typeof seatIndex === "string") {
      return seatIndex;
    }

    room.seats[seatIndex] = socket;
    sockets.set(socket, room.id);

    broadcastRoomStatus(room);
    injectSocketToGame(socket);
  }

  function injectSocketToGame(socket: ServerSocket<S>) {
    const room = getSocketRoom(socket);
    if (!room || !room.gameMaster) return;
    room.gameMaster.setSocket(room.seats.indexOf(socket), socket);
  }

  function broadcastRoomStatus({ id, seats, gameMaster }: Room<S>) {
    const modSeats = seats.map((socket, idx) => ({
      avatar: avatars[idx],
      name: `P${idx + 1}`,
      connected: socket ? true : false,
    }));

    seats.forEach((socket, player) => {
      if (!socket) return;
      socket.send([
        "server",
        {
          id,
          player,
          seats: modSeats,
          started: gameMaster ? true : false,
        },
      ]);
    });
  }

  function startGame(socket: ServerSocket<S>, options: S["options"] = null) {
    const room = getSocketRoom(socket);

    if (!room) return "You're not even in a room!";
    if (room.seats.indexOf(socket) !== 0)
      return "You have to be the first player to start the game.";

    const machine = createMachine(gameDefinition, {
      ctx: {
        numPlayers: room.seats.length,
        options,
        seed: serverOptions ? serverOptions.seed : undefined,
      },
    });

    if (typeof machine === "string") return machine;

    room.machine = machine;
    room.gameMaster = createGameMaster(machine);
    broadcastRoomStatus(room);

    room.seats.forEach((socket, idx) => {
      socket && room.gameMaster?.setSocket(idx, socket);
    });
  }

  function addBot(socket: ServerSocket<S>, server: ServerApi<S>) {
    const room = getSocketRoom(socket);
    if (!room) return "Socket not in a room";
    const [clientSocket, serverSocket] = createLocalSocketPair(server);
    serverSocket.meta = { bot: true };
    // TK wire up client socket
    const res = joinRoom(serverSocket, room.id);
    if (res) return res;
  }

  function submitAction(socket: ServerSocket<S>, action: S["actions"]) {
    const room = getSocketRoom(socket);
    if (!room) return "You are not in a room.";
    if (!room.gameMaster) return "This room's game has not started.";
    const err = room.gameMaster.submit(room.seats.indexOf(socket), action);
    if (err) return err;
  }

  function leaveRoom(socket: ServerSocket<S>) {
    const room = getSocketRoom(socket);
    if (!room) return "Socket is not connected to a room.";

    const seatIndex = room.seats.indexOf(socket);
    if (seatIndex !== -1) {
      room.seats[seatIndex] = null;
      room.gameMaster?.setSocket(seatIndex, null);
    } else {
      return "Socket is in a room but not in a seat. (Huh? This shouldn't happen.)";
    }

    sockets.delete(socket);
    socket.send(["server", null]);

    // TK Check for bot status
    // if empty : rooms.delete(room.id);
  }

  return {
    joinRoom,
    startGame,
    submitAction,
    leaveRoom,
  };
};
